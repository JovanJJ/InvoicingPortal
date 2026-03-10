'use server';

import Project from "./models/Project";
import User from "./models/User";
import { connectDB } from "./connectdb";
import Client from "./models/Client.js";
import Invoice from "./models/Invoice";
import { generateInvoiceNumber } from "@/components/helper/GenerateInvoiceNumber";
import { revalidatePath } from "next/cache";
import TimeEntry from "./models/TimeEntry";
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from "@/components/PDF/InvoicePDF";
import { v2 as cloudinary } from 'cloudinary';
import getSession from '@/lib/auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";




function splitEntryAcrossDays(entry, timezone) {
    const start = new Date(entry.timerStartedAt)
    const stop = new Date(entry.timerStoppedAt)
    const result = {}

    const startDate = start.toLocaleDateString('en-CA', { timeZone: timezone })
    const stopDate = stop.toLocaleDateString('en-CA', { timeZone: timezone })

    if (startDate === stopDate) {
        result[startDate] = entry.duration
        return result
    }

    let current = new Date(start)

    while (true) {
        const currentDate = current.toLocaleDateString('en-CA', { timeZone: timezone })
        const nextDay = new Date(current)
        nextDay.setDate(nextDay.getDate() + 1)
        const midnight = new Date(nextDay.toLocaleDateString('en-CA', { timeZone: timezone }))

        if (currentDate === stopDate) {
            const secondsThisDay = Math.floor((stop - current) / 1000)
            result[currentDate] = (result[currentDate] || 0) + secondsThisDay
            break
        } else {
            const secondsThisDay = Math.floor((midnight - current) / 1000)
            result[currentDate] = (result[currentDate] || 0) + secondsThisDay
            current = midnight
        }
    }

    return result
}



async function createClient(clientContactName, clientEmail, clientCountry) {
    await connectDB();
    const client = await Client.create({
        clientName: clientContactName,
        clientEmail: clientEmail,
        clientCountry: clientCountry,
    })

    const clientId = client._id.toString();
    if (client) {
        return { clientId: clientId, success: true }
    }
}

async function createProject(projectName, paymentType, clientId) {
    const session = await getSession();
    await connectDB();
    const project = await Project.create({
        name: projectName,
        userId: session.user?.id,
        clientId: clientId,
        paymentType: paymentType,

    });

    if (project) {
        return { success: true }
    }
}

export async function fetchUser(userId) {
    const user = await User.findById(userId);
    return user;
}

export async function handleCreateProject(formData) {
    const { projectName, clientContactName, clientEmail, clientCountry, paymentType } = await formData;

    const { clientId } = await createClient(clientContactName, clientEmail, clientCountry);
    const project = await createProject(projectName, paymentType, clientId);



    if (clientId && project.success) {
        return { success: true, message: "Successfully created project!" }
    } else {
        return { success: false, message: "Something went wrong, please try again" }
    }
}

export async function fetchProjectList(userId) {
    await connectDB();
    const list = await Project.find({ userId }).lean();

    return list;
}

export async function fetchProjectById(id) {
    await connectDB();
    const data = await Project.findById(id).lean();
    let project = {
        projectId: data._id.toString(),
        name: data.name,
        userId: data.userId.toString(),
        clientId: data.clientId.toString(),
        paymentType: data.paymentType,
        rate: data.rate,
        currency: data.currency,
        estimatedHours: data.estimatedHours,
        startDate: data.startDate,
        dueDate: data.dueDate,
        status: data.status,
        totalLoggedHours: data.totalLoggedHours,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    }
    return project;
}

export async function fetchClient(id) {
    await connectDB();
    const data = await Client.findById(id).lean();

    const client = {
        id: data._id.toString(),
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientCounty: data.clientCounty,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
    }

    return client;
}

export async function updateClient(id, update) {
    try {
        await connectDB();
        const client = await Client.findByIdAndUpdate(
            id,
            update,
            { new: true }
        ).lean();
        revalidatePath("/projects");
        return client.clientName;

    } catch (error) {
        return { success: false, message: error.message }
    }
}

export async function updateProject(projectId, updates) {
    try {
        await connectDB();

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            updates,
            { new: true }
        ).lean();

        if (updatedProject) {
            revalidatePath("/projects");
            return { success: true, message: "Project updated successfully!", updatedProject: { ...updatedProject, _id: updatedProject._id.toString(), userId: updatedProject.userId.toString(), clientId: updatedProject.clientId.toString() } };
        } else {
            return { success: false, message: "Failed to update project - project not found" };
        }
    } catch (error) {
        console.error('Error updating project:', error);
        return { success: false, message: error.message };
    }
}

export async function startTimer(projectId, userId) {
    await connectDB();
    const time = await TimeEntry.create({
        projectId,
        userId,
        timerStartedAt: new Date(),
        accumulatedSeconds: 0,
        status: "running",
    });

    const plainTime = time.toObject();
    return { startedAt: plainTime.timerStartedAt, timerId: plainTime._id.toString() };
}

export async function pauseTimer(timerId) {
    await connectDB();
    const timer = await TimeEntry.findById(timerId);
    const now = new Date();

    const sessionSeconds = Math.floor((now - timer.timerStartedAt) / 1000);

    const totalAccumulated = timer.accumulatedSeconds + sessionSeconds;

    const time = await TimeEntry.findByIdAndUpdate(
        timerId,
        {
            pausedAt: now,
            accumulatedSeconds: totalAccumulated,
            //timerStartedAt: null,
            status: 'paused'
        },
        { new: true }
    ).lean();
    return time.accumulatedSeconds;
}

export async function resumeTimer(timerId) {
    await connectDB();
    const time = await TimeEntry.findByIdAndUpdate(
        timerId,
        {
            timerStartedAt: new Date(),
            pausedAt: null,
            status: 'running'
        },
        { new: true }
    ).lean()
    return {
        accumulatedSeconds: time.accumulatedSeconds,
        timerStartedAt: time.timerStartedAt.toISOString(),
    }
}

export async function stopTimer(timerId) {
    await connectDB();
    const now = new Date();
    const timer = await TimeEntry.findById(timerId)

    if (!timer) {
        throw new Error('Timer entry not found');
    }

    const sessionSeconds = timer.timerStartedAt
        ? Math.floor((now - timer.timerStartedAt) / 1000)
        : 0

    const totalDuration = timer.accumulatedSeconds + sessionSeconds

    const completed = await TimeEntry.findByIdAndUpdate(
        timerId,
        {
            timerStoppedAt: now,
            duration: totalDuration,
            status: 'completed'
        },
        { new: true }
    ).lean();
    return completed.duration;
}

export async function abortTimer(timerId) {
    const timer = await TimeEntry.findByIdAndDelete(timerId);
}


export async function getRunningTimer(projectId) {
    if (!projectId) return null;
    await connectDB()
    const timer = await TimeEntry.findOne({
        projectId,
        status: { $in: ['running', 'paused'] }
    }).sort({ createdAt: -1 }).lean()

    if (!timer) return null;

    return {
        _id: timer._id.toString(),
        projectId: timer.projectId.toString(),
        userId: timer.userId.toString(),
        timerStartedAt: timer.timerStartedAt ? timer.timerStartedAt.toISOString() : null,
        timerStoppedAt: timer.timerStoppedAt ? timer.timerStoppedAt.toISOString() : null,
        pausedAt: timer.pausedAt ? timer.pausedAt.toISOString() : null,
        accumulatedSeconds: timer.accumulatedSeconds || 0,
        duration: timer.duration || 0,
        status: timer.status,
        billable: timer.billable,
        createdAt: timer.createdAt ? timer.createdAt.toISOString() : null,
        updatedAt: timer.updatedAt ? timer.updatedAt.toISOString() : null,
        serverTime: new Date().toISOString()
    }
}

export async function commitMessage(message, timerId) {
    await connectDB();
    const timer = await TimeEntry.findByIdAndUpdate(
        timerId,
        {
            description: message,
        },
        { new: true }
    );
}

export async function fetchCommitMessages(projectId) {
    await connectDB();
    const projects = await TimeEntry.find({ projectId });

    const filtered = projects.filter(p => p.status === "completed").map((project) => {
        return {
            createdAt: project.createdAt.toString(),
            duration: project.duration,
            description: project.description,
            billable: project.billable,
        };
    });

    return { list: filtered, success: true };
}


export async function fetchProgressPercentage(userId) {
    await connectDB();
    const projectsList = await TimeEntry.find(userId);
    const totalDuration = projectsList.reduce((acc, project) => acc + project.duration, 0);
    const durationInHours = totalDuration / 3600;
    return durationInHours;

}


export async function getDailyHoursForProject(projectId, timezone) {
    await connectDB()

    const entries = await TimeEntry.find({
        projectId,
        status: 'completed'
    }).select('timerStartedAt timerStoppedAt duration')

    if (entries.length === 0) return []

    const dailyMap = {}

    entries.forEach(entry => {

        const split = splitEntryAcrossDays(entry, timezone)

        Object.entries(split).forEach(([date, seconds]) => {
            dailyMap[date] = (dailyMap[date] || 0) + seconds
        })
    })

    const sortedDates = Object.keys(dailyMap).sort()
    const start = new Date(sortedDates[0])
    const end = new Date()
    const result = []

    const current = new Date(start)
    while (current <= end) {
        const dateStr = current.toLocaleDateString('en-CA', { timeZone: timezone })
        const totalSeconds = dailyMap[dateStr] || 0

        result.push({
            date: new Date(dateStr).toLocaleDateString('en-GB', {
                month: 'short',
                day: 'numeric'
            }),
            seconds: totalSeconds
        })

        current.setDate(current.getDate() + 1)
    }

    return result
}


export async function generateInvoicePDF(invoiceData) {
    const buffer = await renderToBuffer(<InvoicePDF invoice={invoiceData} />)
    return buffer
}


export async function uploadProfileImage(formData) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const session = await getSession(authOptions);
    if (!session) throw new Error('Unauthorized')

    const file = formData.get('image')
    if (!file) throw new Error('No file provided')


    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
        throw new Error('Only JPG, PNG and WEBP allowed')
    }


    if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be under 2MB')
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: 'freelance-app/profiles',
                public_id: `user-${session.user.id}`,

            },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        ).end(buffer)
    })

    await User.findByIdAndUpdate(session.user.id, {
        logo: result.secure_url
    })

    return result.secure_url
}

export async function saveInvoice(project, client, timeEntries, user) {
    await connectDB();
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
        projectId: project.id,
        clientId: client.id,
        userId: user.id,
        invoiceNumber: invoiceNumber,
        issueDate: new Date(),
        dueDate: project.dueDate,
        totalAmount: project.rate,
        currency: project.currency,
        commitList: timeEntries,
    });

    // Populate references after creation
    await invoice.populate(["userId", "clientId"]);

    console.log(invoice);
}

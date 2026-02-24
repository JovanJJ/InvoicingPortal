'use server';

import Project from "./models/Project";
import User from "./models/User";
import { connectDB } from "./connectdb";
import Client from "./models/Client.js";
import getSession from "./auth";
import { revalidatePath } from "next/cache";
import TimeEntry from "./models/TimeEntry";





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
            timerStartedAt: null,
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

export async function commitMessage(message, timerId){
    await connectDB();
    console.log("Here is the message", message);
    const timer = await TimeEntry.findByIdAndUpdate(
        timerId,
        {
            description: message,  
        },
        { new: true }
    );
}

export async function fetchCommitMessages(projectId){
    await connectDB();
    const projects = await TimeEntry.find({projectId});
    
    const filtered = projects.map((project) => {
        return{
            createdAt: project.createdAt.toString(),
            duration: project.duration,
            description: project.description
        };
    });

   return {list: filtered, success: true} ;
}


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
import calculateInBaseCurrency from "@/components/helper/calculateBaseCurrency";
import Currency from "./models/Currency";

/*
async function fillCurrencies(currency) {
    await connectDB();

    const existingCurrency = await Currency.findOne({ name: currency });
    if (existingCurrency) {
        console.log(`Currency ${currency} already exists`);
        return;
    }

    const currencies = await Currency.create({
        name: currency,
    })

}

fillCurrencies("USD");
fillCurrencies("EUR");
fillCurrencies("GBP");
fillCurrencies("CHF");
*/

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
    await connectDB();
    const data = await User.findById(userId).lean();
    const hiddenIban = (data.bankAccounts || []).map((acc) => {
        if (!acc.iban || acc.iban.length <= 8) {
            return {
                ...acc,
                _id: acc._id?.toString()
            };
        }

        const start = acc.iban.slice(0, 4)
        const end = acc.iban.slice(-4)
        const count = Math.max(0, acc.iban.length - 8);
        const hidden = "*".repeat(count)
        return {
            ...acc,
            _id: acc._id?.toString(),
            iban: start + hidden + end
        }
    })
    const user = {
        ...data,
        _id: data._id.toString(),
        bankAccounts: hiddenIban
    }
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

export async function fetchProjectList(userId, search) {

    await connectDB();
    const query = { userId: userId };

    if (search) {
        // Step 1: Find all clients matching the search text
        const matchingClients = await Client.find({
            clientName: { $regex: search, $options: "i" }
        }).select('_id').lean();

        // Extract just the IDs into an array
        const clientIds = matchingClients.map(client => client._id);

        // Step 2: Update the $or query to check project name OR the matched client IDs
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { status: { $regex: search, $options: "i" } },
            { clientId: { $in: clientIds } }
        ];
    }

    const list = await Project.find(query)
        .populate({ path: "clientId", select: "clientName" })
        .lean();

    return list;
}

export async function fetchProjectById(id) {
    await connectDB();
    const data = await Project.findById(id).select("name userId clientId paymentType rate currency estimatedHours startDate dueDate status totalLoggedHours createdAt updatedAt taxRate bankAccountId").lean();

    if (!data) return null;

    let project = {
        _id: data._id.toString(),
        projectId: data._id.toString(),
        name: data.name,
        userId: data.userId?.toString(),
        clientId: data.clientId?.toString(),
        paymentType: data.paymentType,
        rate: data.rate,
        currency: data.currency,
        estimatedHours: data.estimatedHours,
        startDate: data.startDate?.toISOString() || null,
        dueDate: data.dueDate?.toISOString() || null,
        status: data.status,
        totalLoggedHours: data.totalLoggedHours,
        createdAt: data.createdAt?.toISOString() || null,
        updatedAt: data.updatedAt?.toISOString() || null,
        taxRate: data.taxRate,
        bankAccountId: data.bankAccountId?.toString() || null,
    }
    return project;
}

export async function fetchClient(id) {
    await connectDB();
    const data = await Client.findById(id).select("clientName clientEmail clientCounty address createdAt updatedAt").lean();

    if (!data) return null;

    const client = {
        _id: data._id.toString(),
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientCounty: data.clientCounty,
        address: data.address,
        createdAt: data.createdAt?.toISOString() || null,
        updatedAt: data.updatedAt?.toISOString() || null,
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
        ).select("clientName address").lean();
        revalidatePath("/projects");
        return client;

    } catch (error) {
        return { success: false, message: error.message }
    }
}

export async function updateProject(projectId, updates, clientId) {
    try {
        console.log(updates.clientAddress);
        console.log(clientId);
        await connectDB();

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            updates,
            { new: true }
        ).lean();
        console.log(updates);

        await calculateProjectValue(projectId);

        if (updates.clientAddress) {
            await updateClient(clientId, { address: updates.clientAddress });
        }

        if (updatedProject) {
            revalidatePath("/projects");
            return { success: true, message: "Project updated successfully!", updatedProject: { ...updatedProject, _id: updatedProject._id.toString(), userId: updatedProject.userId?.toString(), clientId: updatedProject.clientId?.toString(), bankAccountId: updatedProject.bankAccountId?.toString() } };
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
    const timer = await TimeEntry.findById(timerId).select("status timerStartedAt accumulatedSeconds");

    if (!timer) {
        throw new Error('Timer entry not found');
    }

    if (timer.status !== 'running') {
        return timer.accumulatedSeconds;
    }

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
    ).select("accumulatedSeconds timerStartedAt").lean()
    return {
        accumulatedSeconds: time.accumulatedSeconds,
        timerStartedAt: time.timerStartedAt.toISOString(),
    }
}

export async function stopTimer(timerId) {
    await connectDB();
    const now = new Date();
    const timer = await TimeEntry.findById(timerId).select("status timerStartedAt accumulatedSeconds projectId");

    if (!timer) {
        throw new Error('Timer entry not found');
    }

    const sessionSeconds = (timer.status === 'running' && timer.timerStartedAt)
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

    await calculateLogedHours(timer.projectId.toString());

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
            status: 'completed'
        },
        { new: true }
    );

}

export async function fetchCommitMessages(projectId) {
    await connectDB();
    const projects = await TimeEntry.find({ projectId }).select("status createdAt duration description billable invoiceId").populate("invoiceId");

    const filtered = projects.filter(p => p.status === "completed").map((project) => {
        return {
            _id: project._id.toString(),
            createdAt: project.createdAt.toString(),
            duration: project.duration,
            description: project.description,
            billable: project.billable,
            invoiceId: project.invoiceId ? project.invoiceId._id.toString() : null,
        };
    });

    return { list: filtered, success: true };
}



export async function fetchProgressPercentage(projectId) {
    await connectDB();
    const projectsList = await TimeEntry.find({ projectId: projectId }).select("duration").lean();
    const totalDuration = projectsList.reduce((acc, project) => acc + Number(project.duration), 0);
    const durationInHours = Number(totalDuration) / 3600;

    return durationInHours;
}

export async function projectProgressPercentage(projectId) {
    await connectDB();
    const project = await Project.findById(projectId).select("estimatedHours").lean();
    if (!project || !project.estimatedHours || project.estimatedHours === 0) {
        return 0;
    }

    const timeEntries = await TimeEntry.find({ projectId: projectId }).select("duration").lean();
    if (!timeEntries || timeEntries.length === 0) {
        return 0;
    }

    const totalDurationInSeconds = timeEntries.reduce((acc, entry) => acc + (entry.duration || 0), 0);
    const percentage = (totalDurationInSeconds / 3600) / Number(project.estimatedHours) * 100;

    return percentage.toFixed(2);
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

export async function updateUserSettings(userId, data) {
    console.log(data);
    try {
        await connectDB();
        const { defaultCurrency, notification, address, taxIdType, taxIdNumber } = data;
        const updateDoc = {};
        if (defaultCurrency !== undefined) updateDoc.defaultCurrency = defaultCurrency;
        if (notification !== undefined) updateDoc.notifications = notification;
        if (address !== undefined) updateDoc.address = address;
        if (taxIdType !== undefined) updateDoc.taxIdType = taxIdType;
        if (taxIdNumber !== undefined) updateDoc.taxIdNumber = taxIdNumber;

        await User.findByIdAndUpdate(userId, updateDoc, { new: true });
        revalidatePath("/settings");
        return { success: true, message: "Settings updated successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function addBankAccount(userId, bankData) {
    try {
        await connectDB();
        const { bankName, iban, currency } = bankData;
        if (iban.length < 15 || iban.length > 34) return { success: false, message: "IBAN must be between 15 and 34 characters long" };
        if (!bankName || !iban || !currency) return { success: false, message: "All fields are required" };
        const user = await User.findById(userId);
        if (!user) return { success: false, message: "User not found" };

        user.bankAccounts.push({
            bankName,
            iban,
            currency,
            isDefault: user.bankAccounts.length === 0
        });

        await user.save();
        revalidatePath("/settings");
        return { success: true, message: "Bank account added successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function saveInvoice(project, client, timeEntries, user) {
    await connectDB();
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
        projectId: project.projectId,
        clientId: project.clientId,
        userId: project.userId,
        invoiceNumber: invoiceNumber,
        issueDate: new Date(),
        dueDate: project.dueDate,
        totalAmount: project.rate,
        currency: project.currency,
        commitList: timeEntries,
    });

    await invoice.populate(["userId", "clientId"]);

    return { invoiceNumber: invoice.invoiceNumber, invoiceId: invoice._id.toString() };
}


export async function fetchInvoices(userId, searchParams) {

    const filter = {
        userId: userId
    };

    if (searchParams?.project && searchParams.project !== 'all') {
        filter.projectId = searchParams.project
    }

    if (searchParams?.client && searchParams.client !== 'all') {
        filter.clientId = searchParams.client
    }

    if (searchParams?.status && searchParams.status !== 'all') {
        filter.status = searchParams.status;
    }

    let sortOptions = { createdAt: -1 };

    if (searchParams?.date && searchParams.date !== 'all') {
        if (searchParams.date === 'newest') {
            sortOptions.createdAt = -1;
        } else {
            sortOptions.createdAt = 1;
        }
    }

    await connectDB();
    const invoices = await Invoice.find(filter)
        .populate("projectId")
        .populate("clientId")
        .populate("userId")
        .sort(sortOptions)
        .lean();

    return Promise.all(invoices.map(async (inv) => {

        const totalDue = await calculateTotal(inv._id, inv.projectId?._id);
        return {
            ...inv,
            _id: inv._id.toString(),
            projectId: inv.projectId ? {
                ...inv.projectId,
                _id: inv.projectId._id.toString(),
                userId: inv.projectId.userId?.toString(),
                clientId: inv.projectId.clientId?.toString(),
                bankAccountId: inv.projectId.bankAccountId?.toString()
            } : null,
            totalDue,
            clientId: inv.clientId ? {
                ...inv.clientId,
                _id: inv.clientId._id.toString()
            } : null,
            userId: inv.userId ? {
                ...inv.userId,
                _id: inv.userId._id.toString(),
                bankAccounts: (inv.userId.bankAccounts || []).map(acc => ({
                    ...acc,
                    _id: acc._id?.toString()
                }))
            } : null,
            issueDate: inv.issueDate ? inv.issueDate.toISOString() : null,
            dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
            createdAt: inv.createdAt ? inv.createdAt.toISOString() : null,
            updatedAt: inv.updatedAt ? inv.updatedAt.toISOString() : null,

            commitList: (inv.commitList || []).map(entry => ({
                ...entry,
                _id: entry._id?.toString(),
                createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt
            })),
            payments: (inv.payments || []).map(payment => ({
                ...payment,
                _id: payment._id?.toString(),
                paidAt: payment.paidAt instanceof Date ? payment.paidAt.toISOString() : payment.paidAt,
                recordedAt: payment.recordedAt instanceof Date ? payment.recordedAt.toISOString() : payment.recordedAt
            })),
        }
    }));
}

export async function calculateTotal(invoiceId, projectId) {
    if (!invoiceId || !projectId) return "0.00";
    await connectDB();

    const project = await Project.findById(projectId).select("paymentType rate");
    if (!project) return "0.00";

    if (project.paymentType === "fixed") {
        const inv = await Invoice.findById(invoiceId).select("totalAmount");
        return inv ? (Number(inv.totalAmount) || 0).toFixed(2) : "0.00";
    }

    const filter = {
        invoiceId: invoiceId
    }
    const res = await TimeEntry.find(filter).select("duration");

    const numberRate = project.rate || 0;
    const totalSeconds = res.reduce((acc, time) => acc + time.duration, 0);
    const totalhours = totalSeconds / 3600;
    const total = (totalhours * Number(numberRate)).toFixed(2);

    return total;
}

export async function invoiceNotes(invoiceId, fields) {
    await connectDB();
    const updates = {
        $push: {
            payments: {
                amount: fields.amount,
                paidAt: fields.date,
                note: fields.note,
            }
        }
    }

    const response = await Invoice.findByIdAndUpdate(invoiceId, updates, { new: true }).select("payments");

    if (response && response.payments) {
        const totalPaid = response.payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
        await Invoice.findByIdAndUpdate(invoiceId, { totalPaid });
    }

    revalidatePath("/invoice");

    if (response) {
        return { success: true, message: "Successfully added note" }
    } else {
        return { success: false, message: "Internal server error" }
    }
}


export async function deletePaymentUpdate(invoiceId, paymentsId) {
    await connectDB();
    const response = await Invoice.findByIdAndUpdate(invoiceId, {
        $pull: {
            payments: {
                _id: paymentsId
            }
        }
    }, { new: true }).select("payments");

    if (response && response.payments) {
        const totalPaid = response.payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
        await Invoice.findByIdAndUpdate(invoiceId, { totalPaid });
    }

    revalidatePath("/invoice");

    if (response) {
        return { success: true, message: "Successfully deleted payment update" }
    } else {
        return { success: false, message: "Internal server error" }
    }
};

export async function updateInvoiceStatus(invoiceId, update) {
    const totalEarnings = await calculateInvoiceTotalPaid(invoiceId);
    const updates = {
        status: String(update),
        totalPaid: totalEarnings,
    }
    await connectDB();
    const res = await Invoice.findByIdAndUpdate(invoiceId, updates, { new: true })
    if (res) {
        revalidatePath("/invoices")
        return { success: true, message: "Status Changed" }
    } else {
        return { success: false, message: "Something went wrong" }
    }

}


export async function calculateEarnings(userId, currency) {
    await connectDB();
    const baseCurrency = currency || "USD";
    const rates = await calculateInBaseCurrency();
    const invoices = await Invoice.find({
        userId: userId,
    }).select("currency totalPaid ").populate({ path: "projectId", select: "status" });

    const total = invoices.filter(i => i.projectId?.status === "active").reduce((acc, invoice) => {
        const currency = invoice.currency;
        const value = invoice.totalPaid;

        if (currency === rates.base_code) {
            return acc + Number(value);
        }
        const convertedValue = (Number(value) / Number(rates.conversion_rates[currency])) * Number(rates.conversion_rates[baseCurrency]);
        return acc + convertedValue;
    }, 0);
    return { success: true, earnings: total.toFixed(2) }

}

export async function calculateInvoiceTotalPaid(invoiceId) {
    await connectDB();
    const invoice = await Invoice.findById(invoiceId).select("payments");

    if (!invoice || !invoice.payments || invoice.payments.length === 0) {
        return 0;
    }

    const total = invoice.payments.reduce((acc, payment) => acc + Number(payment.amount || 0), 0);
    return total;
}


export async function calculateLogedHours(projectId) {
    await connectDB();
    const timeEntries = await TimeEntry.find({ projectId: projectId }).select("duration");
    let totalLoggedSeconds = 0;
    for (const ent of timeEntries) {
        totalLoggedSeconds += ent.duration;
    }
    const totalLoggedHours = (totalLoggedSeconds / 3600).toFixed(2);

    await Project.findByIdAndUpdate({ _id: projectId }, { totalLoggedHours: totalLoggedHours });

    await calculateProjectValue(projectId);

}

export async function fetchLoggedHours(userId) {
    await connectDB();
    const projects = await Project.find({ userId: userId, status: "active" }).select("totalLoggedHours");
    const loggedHours = projects.reduce((acc, project) => acc + project.totalLoggedHours, 0);
    return { success: true, totalLoggedHours: loggedHours };
}

export async function calculateProjectValue(projectId) {
    await connectDB();
    const project = await Project.findById(projectId).select("paymentType totalLoggedHours rate totalValue");
    if (!project) return;

    if (project.paymentType === "hourly") {
        project.totalValue = project.totalLoggedHours * project.rate
    } else if (project.paymentType === "fixed") {
        project.totalValue = project.rate
    }
    await project.save();
}

export async function projectsValueInBaseCurrency(userId, currency) {
    const baseCurrency = currency || "USD";
    await connectDB();
    const rates = await calculateInBaseCurrency();

    const projects = await Project.find({ userId: userId, status: "active" }).select("totalValue currency").lean();

    const projectsValue = projects.reduce((acc, project) => {
        const value = project.totalValue;
        const currency = project.currency;

        if (currency === rates.base_code) {
            return acc + Number(value);
        }

        const convertedValue = (Number(value) / Number(rates.conversion_rates[currency])) * Number(rates.conversion_rates[baseCurrency]);
        return acc + convertedValue;
    }, 0);

    return { success: true, projectsValue: Number(projectsValue.toFixed(2)) };
}

export async function moneyToCharge(userId, currency) {
    const projectsValue = await projectsValueInBaseCurrency(userId, currency);
    const earnings = await calculateEarnings(userId, currency);

    return (Number(projectsValue.projectsValue) - Number(earnings.earnings)).toFixed(2);
}

export async function fetchPaymentPercentage(projectId) {
    await connectDB();
    const project = await Project.find({ _id: projectId, paymentType: "fixed" }).select("rate currency").lean();
    if (project.length === 0) { return { fixedRate: 0, currency: "", totalPaid: 0, paymentPercentage: 0 } }
    const projectRate = project[0].rate;
    const currency = project[0].currency;

    const payments = await Invoice.find({ projectId: projectId }).select("totalPaid").lean();

    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.totalPaid) || 0), 0);

    const percentage = (Number(totalPaid) / Number(projectRate) * 100).toFixed(2);

    return { fixedRate: projectRate, currency: currency, totalPaid: totalPaid, paymentPercentage: percentage }
}

export async function fetchProjectsNames(userId) {
    await connectDB();
    const projects = await Project.find({ userId: userId }).select("name _id").lean();

    return projects.map(p => ({
        id: p._id.toString(),
        name: p.name
    }));
}

export async function fetchClientNames(userId) {
    await connectDB();
    const clients = await Client.find({}).select("clientName _id").lean();

    return clients.map(c => ({
        id: c._id.toString(),
        name: c.clientName
    }));
}

export async function deleteBankAccount(userId, bankId) {
    await connectDB();
    const user = await User.findById(userId).select("bankAccounts");
    if (!user) {
        return { success: false, message: "User not found" }
    }
    const bankAccounts = user.bankAccounts.filter(bank => bank._id.toString() !== bankId);
    await User.findByIdAndUpdate(userId, { bankAccounts });
    revalidatePath("/settings");
    return { success: true, message: "Bank account deleted" }
}

export async function pickDefaultBankAccount(userId, bankId) {
    await connectDB();
    const user = await User.findById(userId).select("bankAccounts");
    if (!user) {
        return { success: false, message: "User not found" }
    }

    user.bankAccounts.forEach(bank => {
        bank.isDefault = (bank._id.toString() === bankId);
    });

    await user.save();
    revalidatePath("/settings");
    return { success: true, message: "Bank account set as default" }
}

export async function splitTimeEntryByInvoice(timeEntryId, invoiceId) {
    await connectDB();
    const timeEntry = await TimeEntry.findById(timeEntryId);
    if (!timeEntry) {
        return { success: false, message: "Time entry not found" }
    }
    timeEntry.invoiceId = invoiceId;
    await timeEntry.save();
    revalidatePath("/projects");
    return { success: true, message: "Time entry split" }
}

export async function fetchCurrencies() {
    await connectDB();
    const data = await Currency.find().lean();
    return data.map(d => ({
        id: d._id.toString(),
        name: d.name
    }));
}

export async function fetchProjectBankAccount(projectId, userId) {
    await connectDB();
    const project = await Project.findById(projectId).select("bankAccountId").lean();
    const bankAccountId = project.bankAccountId;
    const user = await User.findById(userId).select("bankAccounts").lean();
    const bankAccount = user.bankAccounts.find(bank => bank._id.toString() === bankAccountId);
    console.log(bankAccount);
    return bankAccount;
}


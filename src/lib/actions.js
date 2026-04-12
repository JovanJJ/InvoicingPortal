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
import nodemailer from "nodemailer";
import formatDurationForInvoice from "@/components/FormatDurationForInvoice";
import { encryptIBAN } from "./encryption";
import { decryptIBAN } from "./encryption";

function maskIban(iban) {
    if (!iban) return "";
    if (iban.length <= 8) return iban;

    const start = iban.slice(0, 4);
    const end = iban.slice(-4);
    const hidden = "*".repeat(Math.max(0, iban.length - 8));

    return start + hidden + end;
}

/*
async function fillCurrencies(currency) {
    await connectDB();

    const existingCurrency = await Currency.findOne({ name: currency });
    if (existingCurrency) {
        (`Currency ${currency} already exists`);
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

async function createClient(clientContactName, clientEmail, clientCountry, userId) {
    await connectDB();
    const client = await Client.create({
        clientName: clientContactName,
        clientEmail: clientEmail,
        clientCountry: clientCountry,
        userId: userId,
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
        if (!acc.iban) {
            return {
                ...acc,
                _id: acc._id?.toString()
            };
        }

        let decryptedIban = acc.iban;
        try {
            decryptedIban = decryptIBAN(acc.iban);
        } catch (error) {
            console.error("Failed to decrypt IBAN in fetchUser:", error);
        }

        return {
            ...acc,
            _id: acc._id?.toString(),
            iban: maskIban(decryptedIban)
        }
    })
    console.log("hiden", hiddenIban);
    const user = {
        ...data,
        _id: data._id.toString(),
        bankAccounts: hiddenIban
    }
    return user;
}

export async function fetchUserDefaultCurrnecy(userId) {
    try {
        await connectDB();
        const userDefaultCurrency = await User.findById(userId).select("defaultCurrency").lean();
        if (userDefaultCurrency) {
            return { success: true, currency: userDefaultCurrency.defaultCurrency }
        }
        return
    } catch (error) {
        console.error(error);
        return { success: false, currency: [] }
    }

}

export async function handleCreateProject(formData) {
    try {
        const session = await getSession();
        const userId = session.user?.id;
        const { projectName, clientContactName, clientEmail, clientCountry, paymentType } = await formData;
        if (!projectName, !clientContactName, !clientEmail, !clientCountry, !paymentType) {
            return { success: false, message: "All fields are required" }
        }

        const { clientId } = await createClient(clientContactName, clientEmail, clientCountry, userId);
        const project = await createProject(projectName, paymentType, clientId);
        if (clientId && project.success) {
            revalidatePath("/projects");
            return { success: true, message: "Successfully created project!" }
        } else {
            return { success: false, message: "Something went wrong, please try again" }
        }

    } catch (error) {
        console.error(error);
    }





}

export async function fetchProjectList(userId, search) {

    await connectDB();
    const query = { userId: userId };

    if (search) {
        const matchingClients = await Client.find({
            clientName: { $regex: search, $options: "i" }
        }).select('_id').lean();

        const clientIds = matchingClients.map(client => client._id);

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
    const data = await Client.findById(id).select("clientName clientEmail clientCountry address createdAt updatedAt taxIdType taxIdNumber").lean();

    if (!data) return null;

    const client = {
        _id: data._id.toString(),
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientCountry: data.clientCountry,
        address: data.address,
        taxIdType: data.taxIdType,
        taxIdNumber: data.taxIdNumber,
        createdAt: data.createdAt?.toISOString() || null,
        updatedAt: data.updatedAt?.toISOString() || null,
    }

    return client;
}

export async function fetchProjectsAndClients(userId) {
    await connectDB();
    const mongoose = (await import("mongoose")).default;
    const data = await Project.aggregate([

        { $match: { userId: new mongoose.Types.ObjectId(userId) } },

        {
            $group: {
                _id: "$clientId",
                projects: {
                    $push: {
                        _id: "$_id",
                        name: "$name"
                    }
                }
            }
        },

        {
            $lookup: {
                from: "clients",

                localField: "_id",
                foreignField: "_id",
                as: "clientDetails"
            }
        },

        { $unwind: "$clientDetails" },

        {
            $project: {
                _id: { $toString: "$clientDetails._id" },
                clientName: "$clientDetails.clientName",
                clientEmail: "$clientDetails.clientEmail",
                clientCountry: "$clientDetails.clientCountry",
                address: "$clientDetails.address",
                taxIdType: "$clientDetails.taxIdType",
                taxIdNumber: "$clientDetails.taxIdNumber",
                createdAt: "$clientDetails.createdAt",
                projects: {
                    $map: {
                        input: "$projects",
                        as: "proj",
                        in: {
                            _id: { $toString: "$$proj._id" },
                            name: "$$proj.name"
                        }
                    }
                }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return JSON.parse(JSON.stringify(data));
}

export async function updateClient(id, data) {
    try {
        await connectDB();
        const { _id, ...updateData } = data;
        const client = await Client.findByIdAndUpdate(
            id,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        ).select("clientName address taxIdType taxIdNumber").lean();
        revalidatePath("/clients");
        revalidatePath("/projects");
        return { success: true };

    } catch (error) {
        return { success: false, message: error.message }
    }
}

export async function updateProject(projectId, updates, clientId) {
    try {
        await connectDB();

        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            updates,
            { returnDocument: 'after' }
        ).lean();

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
        { returnDocument: 'after' }
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
        { returnDocument: 'after' }
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

    const totalDurationSeconds = timer.accumulatedSeconds + sessionSeconds
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60)

    const completed = await TimeEntry.findByIdAndUpdate(
        timerId,
        {
            timerStoppedAt: now,
            duration: totalDurationMinutes,
            status: 'completed'
        },
        { returnDocument: 'after' }
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
    revalidatePath("/projects", "layout");
}

export async function fetchCommitMessages(projectId) {
    await connectDB();
    const projects = await TimeEntry.find({ projectId }).select("status createdAt updatedAt duration description billable invoiceId projectId").populate("invoiceId");

    const filtered = projects.filter(p => p.status === "completed").map((project) => {
        return {
            _id: project._id.toString(),
            projectId: project.projectId.toString(),
            createdAt: project.createdAt.toString(),
            updatedAt: project.updatedAt.toString(),
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
    const durationInHours = Number(totalDuration) / 60;

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
    const percentage = (totalDurationInSeconds / 60) / Number(project.estimatedHours) * 100;

    return percentage.toFixed(2);
}


export async function getDailyHoursForProject(projectId, timezone) {
    await connectDB()

    const entries = await TimeEntry.find({
        projectId,
        status: 'completed'
    }).select('createdAt updatedAt timerStoppedAt duration')

    if (entries.length === 0) return []

    const dailyMap = {}

    entries.forEach(entry => {
        const effectiveDate = entry.updatedAt || entry.timerStoppedAt || entry.createdAt
        if (!effectiveDate) return

        const dateKey = new Date(effectiveDate).toLocaleDateString('en-CA', { timeZone: timezone })
        const durationMinutes = Number(entry.duration) || 0
        const durationSeconds = durationMinutes * 60

        dailyMap[dateKey] = (dailyMap[dateKey] || 0) + durationSeconds
    })

    const sortedDates = Object.keys(dailyMap).sort()
    if (sortedDates.length === 0) return []
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
        const { bankName, iban, currency, accountOwnerFirstName, accountOwnerLastName } = bankData;
        if (iban.length < 15 || iban.length > 34) return { success: false, message: "IBAN must be between 15 and 34 characters long" };
        if (!bankName || !iban || !currency || !accountOwnerFirstName || !accountOwnerLastName) return { success: false, message: "All fields are required" };
        const user = await User.findById(userId);
        if (!user) return { success: false, message: "User not found" };
        const encryptedIban = encryptIBAN(iban);
        console.log("here", encryptedIban)

        user.bankAccounts.push({
            bankName,
            iban: encryptedIban,
            currency,
            accountOwnerFirstName,
            accountOwnerLastName,
            isDefault: user.bankAccounts.length === 0
        });

        await user.save();
        revalidatePath("/settings");
        return { success: true, message: "Bank account added successfully" };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function saveInvoice(project, client, timeEntries, user, dueDate, notes) {
    await connectDB();
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
        projectId: project.projectId,
        clientId: project.clientId,
        userId: project.userId,
        invoiceNumber: invoiceNumber,
        issueDate: new Date(),
        dueDate: dueDate,
        totalAmount: project.rate,
        currency: project.currency,
        commitList: timeEntries,
        notes: notes,
    });

    await invoice.populate(["userId", "clientId"]);
    revalidatePath("/invoices");
    revalidatePath("/projects");

    return { invoiceNumber: invoice.invoiceNumber, invoiceId: invoice._id.toString(), message: "Successfully saved Invoice, check on invoice page" };
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
                _id: inv.clientId._id.toString(),
                userId: inv.clientId.userId ? inv.clientId.userId.toString() : null,
                createdAt: inv.clientId.createdAt ? inv.clientId.createdAt.toISOString() : null,
                updatedAt: inv.clientId.updatedAt ? inv.clientId.updatedAt.toISOString() : null,
            } : null,
            userId: inv.userId ? {
                ...inv.userId,
                _id: inv.userId._id.toString(),
                bankAccounts: (inv.userId.bankAccounts || []).map(acc => {
                    let decryptedIban = acc.iban;

                    try {
                        decryptedIban = decryptIBAN(acc.iban);
                    } catch (error) {
                        console.error("Failed to decrypt IBAN in fetchInvoices:", error);
                    }

                    return {
                        ...acc,
                        _id: acc._id?.toString(),
                        iban: decryptedIban
                    };
                })
            } : null,
            issueDate: inv.issueDate ? inv.issueDate.toISOString() : null,
            dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
            createdAt: inv.createdAt ? inv.createdAt.toISOString() : null,
            updatedAt: inv.updatedAt ? inv.updatedAt.toISOString() : null,

            commitList: (inv.commitList || []).map(entry => ({
                ...entry,
                _id: entry._id?.toString(),
                createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
                updatedAt: entry.updatedAt instanceof Date ? entry.updatedAt.toISOString() : entry.updatedAt
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
    const totalhours = totalSeconds / 60;
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

    const response = await Invoice.findByIdAndUpdate(invoiceId, updates, { returnDocument: 'after' }).select("payments");

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
    }, { returnDocument: 'after' }).select("payments");

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
    const res = await Invoice.findByIdAndUpdate(invoiceId, updates, { returnDocument: 'after' })
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
    const rates = await calculateInBaseCurrency(baseCurrency);
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
        totalLoggedSeconds += Number(ent.duration) || 0;
    }
    const totalLoggedHours = Number((totalLoggedSeconds / 60).toFixed(2));

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

    const loggedHours = Number(project.totalLoggedHours) || 0;
    const rate = Number(project.rate) || 0;

    let totalValue = 0;
    if (project.paymentType === "hourly") {
        totalValue = Number((loggedHours * rate).toFixed(2));
    } else if (project.paymentType === "fixed") {
        totalValue = Number(rate) || 0;
    }

    if (!isFinite(totalValue) || isNaN(totalValue)) {
        totalValue = 0;
    }

    project.totalValue = totalValue;
    await project.save();
}

export async function projectsValueInBaseCurrency(userId, currency) {
    const baseCurrency = currency || "USD";
    await connectDB();
    const rates = await calculateInBaseCurrency(baseCurrency);

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

    const percentage = (Number(totalPaid) / Number(projectRate) * 100).toFixed(0);

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
    return bankAccount;
}


export async function fetchBankIban(userId, projectBankId) {
    const user = await User.findById(userId).select("bankAccounts").lean();
    let bankAccount = null;
    if (projectBankId) {
        bankAccount = user.bankAccounts.find(b => b._id.toString() === projectBankId);
    } else {
        bankAccount = user.bankAccounts.find(b => b.isDefault);
    }

    if (bankAccount) {
        let decryptedIban = bankAccount.iban;
        try {
            decryptedIban = decryptIBAN(bankAccount.iban);
        } catch (error) {
            console.error("Failed to decrypt IBAN in fetchBankIban:", error);
        }

        return { accountOwnerFirstName: bankAccount.accountOwnerFirstName, accountOwnerLastName: bankAccount.accountOwnerLastName, bankName: bankAccount.bankName, iban: decryptedIban }
    }

}

export async function updateTimeEntry(entryId, description, durationMinutes) {
    try {
        await connectDB();
        const parsedDuration = Number(durationMinutes);
        const updateDoc = { description };

        // Only update duration if it's a valid number
        if (!isNaN(parsedDuration)) {
            updateDoc.duration = Math.round(parsedDuration);
        }

        const entry = await TimeEntry.findByIdAndUpdate(entryId, updateDoc, { returnDocument: 'after' });

        if (entry && entry.projectId) {
            await calculateLogedHours(entry.projectId.toString());
        }

        revalidatePath("/projects", "layout");
        return { success: true };
    } catch (error) {
        console.error('Error updating time entry:', error);
        return { success: false, message: error.message };
    }
}

export async function updateInvoiceDetails(invoiceId, updates) {
    try {
        await connectDB();

        let projectId = updates.projectId;
        if (!projectId) {
            const invoice = await Invoice.findById(invoiceId).select("projectId");
            if (invoice) projectId = invoice.projectId;
        }

        if (updates.commitList && updates.commitList.length > 0) {
            for (const entry of updates.commitList) {
                const parsedDuration = Number(entry.durationMinutes);

                if (entry.durationMinutes !== undefined && !isNaN(parsedDuration)) {
                    entry.duration = Math.round(parsedDuration);
                }

                if (entry._id) {
                    const updateDoc = {};
                    if (entry.description !== undefined) updateDoc.description = entry.description;
                    if (entry.duration !== undefined) updateDoc.duration = entry.duration;
                    if (entry.displayDate !== undefined) updateDoc.updatedAt = new Date(entry.displayDate);

                    await TimeEntry.findByIdAndUpdate(entry._id, updateDoc, { returnDocument: 'after', timestamps: false });
                }
            }

            if (projectId) {
                await calculateLogedHours(projectId.toString());
                await calculateProjectValue(projectId.toString());
            }
        }

        const invoiceUpdate = {};
        if (updates.issueDate) invoiceUpdate.issueDate = new Date(updates.issueDate);
        if (updates.dueDate) invoiceUpdate.dueDate = new Date(updates.dueDate);
        if (updates.createdAt) invoiceUpdate.createdAt = new Date(updates.createdAt);
        if (updates.currency) invoiceUpdate.currency = updates.currency;
        if (updates.status) invoiceUpdate.status = updates.status;
        if (updates.notes !== undefined) invoiceUpdate.notes = updates.notes;
        if (updates.commitList) {

            invoiceUpdate.commitList = updates.commitList.map(item => {
                const { durationMinutes, displayDate, ...rest } = item;
                if (displayDate !== undefined) {
                    rest.updatedAt = new Date(displayDate);
                }
                return rest;
            });
        }

        await Invoice.findByIdAndUpdate(invoiceId, invoiceUpdate, { returnDocument: 'after' });

        revalidatePath("/invoices");
        return { success: true, message: "Invoice updated successfully." };

    } catch (error) {
        console.error('Error updating invoice details:', error);
        return { success: false, message: error.message };
    }
}

export async function markSentInvoice(invoiceId) {
    await connectDB();
    const invoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { sent: true, status: 'sent' },
        { returnDocument: 'after' }
    ).lean();
    revalidatePath("/invoices");
    return invoice ? { success: true } : { success: false };
}

export async function deleteInvoice(invoiceId) {
    await connectDB();
    const res = await Invoice.findByIdAndDelete(invoiceId);
    revalidatePath("/invoices");
}

export async function sendInvoiceEmail(invoiceData) {
    const {
        userId: user,
        clientId: client,
        projectId: project,
        commitList,
        invoiceNumber,
        issueDate,
        dueDate,
        currency,
        notes,
        totalAmount
    } = invoiceData;
    console.log(invoiceData);
    const formatDateLocal = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-GB");
    };

    const rate = project?.rate || 0;
    const taxRate = project?.taxRate || 0;

    const isFixed = project?.paymentType === 'fixed';
    const subtotal = isFixed
        ? (Number(totalAmount) || 0)
        : (commitList || []).reduce((acc, item) => {
            const seconds = Number(isFinite(item.duration) ? item.duration : 0);
            const total = (seconds / 60) * rate;
            return acc + total;
        }, 0);

    const tax = subtotal * (taxRate / 100);
    const totalDue = subtotal + tax;


    const lineItemsHTML = (commitList || []).map((item, index) => `
        <tr style="background-color: ${index % 2 === 1 ? '#f9fafb' : '#ffffff'};">
            <td style="padding: 16px 20px; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                <div style="font-weight: bold; color: #1f2937;">${item.description || 'Development Work'}</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">${formatDateLocal(item.updatedAt || createdAt)}</div>
            </td>
            <td style="padding: 16px 20px; font-size: 14px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
                ${formatDurationForInvoice(item.duration * 60)}
            </td>
            ${!isFixed ? `
            <td style="padding: 16px 20px; font-size: 14px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #1f2937;">
                ${currency} ${(((item.duration || 0) / 60) * rate).toFixed(2)}
            </td>
            ` : ''}
        </tr>
    `).join('');


    let paymentDetailsHTML = '';
    if (user?.bankAccounts && Array.isArray(user.bankAccounts)) {
        const defaultBank = user.bankAccounts.find(b => b.isDefault) || user.bankAccounts[0];
        if (defaultBank) {
            paymentDetailsHTML = `
          <div style="background: #eef2ff; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin: 32px 0 24px 0;">
            <h4 style="font-weight: bold; color: #1f2937; font-size: 15px; margin-bottom: 8px;">Payment Details</h4>
            ${defaultBank.bankName ? `<div style='color:#374151;font-size:14px;margin-bottom:4px;'>Bank: ${defaultBank.bankName}</div>` : ''}
            ${defaultBank.accountOwnerFirstName && defaultBank.accountOwnerLastName ? `<div style='color:#374151;font-size:14px;margin-bottom:4px;'>Bank Account Holder: ${defaultBank.accountOwnerFirstName} ${defaultBank.accountOwnerLastName}</div>` : ''}
            ${defaultBank.iban ? `<div style='color:#374151;font-size:14px;margin-bottom:4px;'>IBAN: ${defaultBank.iban}</div>` : ''}
            <div style='color:#374151;font-size:14px;margin-bottom:4px;'>Reference: ${invoiceNumber}</div>
          </div>
        `;
        }
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        </style>
    </head>
    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; background-color: #f3f4f6; padding: 40px 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e5e7eb;">
            <!-- Header -->
            <div style="padding: 40px; border-bottom: 1px solid #f3f4f6;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="vertical-align: top;">
                            <div style="font-size: 24px; font-weight: 700; color: #4f46e5; letter-spacing: -0.02em;">${user?.businessName || user?.name || 'Invoicing Portal'}</div>
                        </td>

                        <td style="text-align: right; vertical-align: top;">
                            <h1 style="font-size: 32px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.03em;">INVOICE</h1>
                            <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0 0;">#${invoiceNumber}</p>
                        </td>
                    </tr>
                </table>
                <img src=${user.logo || user.avatar} style="width:100px; height:100px;">
            </div>

            <!-- Addresses -->
            <div style="padding: 40px 40px 20px 40px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 20px;">
                            <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em; margin-bottom: 8px;">From</p>
                            <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0;">${user?.name || ''}</p>
                            <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">${user?.email || ''}</p>
                            <p style="font-size: 14px; color: #4b5563; margin: 2px 0; line-height: 1.5;">${user?.address || ''}</p>
                            <p style="font-size: 14px; color: #4b5563; margin: 2px 0; line-height: 1.5;">Tax ID: ${user?.taxIdType || ''} ${user?.taxIdNumber || ''}</p>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                            <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em; margin-bottom: 8px;">Bill To</p>
                            <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0;">${client?.clientName || ''}</p>
                            <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">${client?.clientEmail || ''}</p>
                            <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">${client?.address || client?.clientCountry || ''}</p>
                            <p style="font-size: 14px; color: #4b5563; margin: 2px 0;">Tax ID: ${client?.taxIdType || ''} ${client?.taxIdNumber || ''}</p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Dates -->
            <div style="margin: 0 40px 30px 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="text-align: center;">
                            <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px;">Date</p>
                            <p style="font-size: 14px; font-weight: 700; color: #111827; margin: 0;">${formatDateLocal(issueDate)}</p>
                        </td>
                        <td style="text-align: center;">
                            <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px;">Due Date</p>
                            <p style="font-size: 14px; font-weight: 700; color: #111827; margin: 0;">${formatDateLocal(dueDate)}</p>
                        </td>
                        <td style="text-align: center;">
                            <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px;">Currency</p>
                            <p style="font-size: 14px; font-weight: 700; color: #111827; margin: 0;">${currency}</p>
                        </td>
                    </tr>
                </table>
            </div>


            <!-- Items -->
            <div style="padding: 0 0 20px 0;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #4f46e5;">
                            <th style="padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase;">Description</th>
                            <th style="padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase;">${isFixed ? 'Duration' : 'Qty'}</th>
                            ${!isFixed ? `<th style="padding: 12px 20px; text-align: right; font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase;">Total</th>` : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${lineItemsHTML}
                    </tbody>
                </table>
            </div>
            ${paymentDetailsHTML}

            <!-- Totals -->
            <div style="padding: 20px 40px 40px 40px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td width="60%"></td>
                        <td width="40%">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Subtotal</td>
                                    <td style="padding: 8px 0; font-size: 14px; text-align: right; color: #111827;">${currency} ${subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">Tax (${taxRate}%)</td>
                                    <td style="padding: 8px 0; font-size: 14px; text-align: right; color: #111827;">${currency} ${tax.toFixed(2)}</td>
                                </tr>
                                <tr style="border-top: 2px solid #4f46e5;">
                                    <td style="padding: 15px 0 0 0; font-size: 18px; font-weight: 700; color: #111827;">Total Due</td>
                                    <td style="padding: 15px 0 0 0; font-size: 20px; font-weight: 800; text-align: right; color: #4f46e5;">${currency} ${totalDue.toFixed(2)}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Footer -->
            <div style="padding: 40px; text-align: center; border-top: 1px solid #f3f4f6; background-color: #fafafa;">
                ${notes ? `
                    <div style="margin-bottom: 25px; padding: 20px; background-color: #fdf2f2; border-left: 4px solid #ef4444; text-align: left; font-style: italic; color: #991b1b; font-size: 14px; border-radius: 4px;">
                        "${notes}"
                    </div>
                ` : ''}
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                    Thank you for your business — ${user?.name || ''} • ${user?.email || ''}
                </p>
                <p style="font-size: 11px; color: #d1d5db; margin: 8px 0 0 0;">
                    Generated by your Invoicing Portal
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODE_MAILER_EMAIL,
                pass: process.env.NODE_MAILER_PW,
            },
        });

        await transporter.sendMail({
            from: `"Invoice app" <${process.env.NODE_MAILER_EMAIL}>`,
            to: client?.clientEmail,
            subject: `Invoice #${invoiceNumber} from ${user?.businessName || user?.name || 'Freelancer'}`,
            html: htmlContent,
        });

        return { success: true, message: "Email sent successfully!" };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, message: "Failed to send email." };
    }
}


export async function deleteTimeEntry(entryId) {
    await connectDB();
    const entry = await TimeEntry.findByIdAndDelete(entryId);
    revalidatePath("/projects", "layout");
    revalidatePath("/invoices", "layout");
}

export async function deleteProject(projectId) {
    try {
        await connectDB();
        const res = await Project.findByIdAndDelete(projectId);
        revalidatePath("/projects");
        return { success: true, message: "Project deleted" }
    } catch (error) {
        console.error(error);
    }
}

export async function updateEntry(updates) {
    try {
        await connectDB();
        const id = updates._id;
        const updatesObj = {
            duration: updates.duration,
            updatedAt: new Date(updates.updatedAt || updates.createdAt),
            description: updates.description
        }
        const res = await TimeEntry.findByIdAndUpdate(id, updatesObj, { new: true, timestamps: false }).lean();
        if (res) {
            calculateProjectValue
            revalidatePath("/projects", "layout");
            return { success: true, message: "Successfully updated session" }
        }
        if (!res) {
            throw new Error("Something went wrong")
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: "Something went wrong, please try again" }
    }
}

export async function fetchProjects() {
    try {
        await connectDB();
        const projects = await Project.find({}).select("_id name").lean();
        if (projects.length > 0) {
            return { success: true, projects: JSON.parse(JSON.stringify(projects)) }
        } else {
            throw new Error("Could not find projects")
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: "Something went wrong" }
    }
}

export async function projectDashStats(projectId, currency) {
    if (!projectId) return null;
    try {
        const rates = await calculateInBaseCurrency(currency);
        const project = await Project.findById(projectId).select("totalValue currency").lean();

        if (!project) return null;

        let projectValue = project.totalValue || 0;
        const projectCurrency = project.currency || "USD";

        if (projectCurrency !== rates.base_code) {
            projectValue = (Number(projectValue) / Number(rates.conversion_rates[projectCurrency])) * Number(rates.conversion_rates[currency]);
        }

        let totalPaid = 0;
        let moneyToCharge = 0;

        const invoices = await Invoice.find({ projectId: project._id }).select("totalPaid currency").lean();


        if (invoices.length > 0) {
            totalPaid = invoices[0]?.totalPaid || 0;

            const invoiceCurrency = invoices[0].currency || "USD";

            if (invoiceCurrency !== rates.base_code) {
                totalPaid = (Number(totalPaid) / Number(rates.conversion_rates[invoices[0].currency])) * Number(rates.conversion_rates[currency]);
            }
        }


        moneyToCharge = Number(projectValue) - Number(totalPaid);

        // Return rounded numbers for visual display
        return {
            success: true,
            dashStats: {
                projectValue: projectValue.toFixed(2),
                totalPaid: totalPaid.toFixed(2),
                moneyToCharge: moneyToCharge >= 0 ? (moneyToCharge).toFixed(2) : `${(moneyToCharge).toFixed(2)}(overpaid)`
            }
        };
    } catch (error) {
        console.error(error);
        return { success: false, message: "server error" }
    }

}

import mongoose from "mongoose";

const timeEntrySchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
    timerStartedAt: { type: Date },
    timerStoppedAt: { type: Date },
    pausedAt: { type: Date },
    accumulatedSeconds: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    billable: { type: Boolean, default: true },
    status: { type: String, enum: ['running', 'paused', 'completed'], default: 'running' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
},
    { timestamps: true });

export default mongoose.models.TimeEntry ||
    mongoose.model("TimeEntry", timeEntrySchema);
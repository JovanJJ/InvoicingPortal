import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    paymentType: { type: String, enum: ['hourly', 'fixed'], required: true },
    rate: { type: Number },
    currency: { type: String, default: 'EUR' },
    estimatedHours: { type: Number, default: 0 },
    startDate: { type: Date },
    dueDate: { type: Date },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
    totalLoggedHours: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    bankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'userId' },
},
    { timestamps: true });

export default mongoose.models.Project ||
    mongoose.model("Project", projectSchema);
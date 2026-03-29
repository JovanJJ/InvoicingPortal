import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    clientName: { type: String },
    clientEmail: { type: String },
    clientCountry: { type: String, required: true },
    address: { type: String },
    taxIdType: { type: String },
    taxIdNumber: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.models.Client ||
    mongoose.model("Client", clientSchema);
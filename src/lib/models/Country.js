import mongoose from "mongoose";

const countrySchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Country ||
  mongoose.model("Country", countrySchema);

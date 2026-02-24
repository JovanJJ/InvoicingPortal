import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    clientName: {type: String}, 
    clientEmail: {type: String},
    clientCountry: {type: String},
},
{timestamps: true}
);

export default mongoose.models.Client ||
mongoose.model("Client", clientSchema);
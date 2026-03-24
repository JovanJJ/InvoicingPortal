import mongoose from "mongoose";

const currencySchema = new mongoose.Schema({
    name: String,
})

const Currency = mongoose.models.Currency || mongoose.model("Currency", currencySchema);

export default Currency;
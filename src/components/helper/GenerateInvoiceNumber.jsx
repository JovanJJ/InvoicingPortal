import { connectDB } from "@/lib/connectdb";
import Counter from "@/lib/models/Counter";

export async function generateInvoiceNumber() {
  await connectDB();

  // findOneAndUpdate is atomic — safe if multiple users create invoices at the same time
  const counter = await Counter.findOneAndUpdate(
    { name: "invoiceNumber" },       // find this counter
    { $inc: { value: 1 } },          // increment by 1
    { new: true, upsert: true }      // create it if it doesn't exist yet
  );

  // formats number as INV-0001, INV-0002 etc.
  const formatted = `INV-${String(counter.value).padStart(4, "0")}`;

  return formatted;
}
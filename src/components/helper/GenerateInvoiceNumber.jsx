import { connectDB } from "@/lib/connectdb";
import Counter from "@/lib/models/Counter";

export async function generateInvoiceNumber() {
  await connectDB();

  const counter = await Counter.findOneAndUpdate(
    { name: "invoiceNumber" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const formatted = `INV-${String(counter.value).padStart(4, "0")}`;

  return formatted;
}
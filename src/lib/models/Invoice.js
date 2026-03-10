import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  invoiceNumber: { type: String },
  issueDate: { type: Date },
  dueDate: { type: Date },
  commitList: [],
  totalAmount: { type: Number }, 
  currency: { type: String },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'partially_paid', 'paid', 'overdue'],
    default: 'draft'
  },
  
  
  payments: [
    {
      amount: { type: Number },
      paidAt: { type: Date },
      method: { type: String, enum: ['bank_transfer', 'stripe', 'paypal', 'cash', 'other'] },
      note: { type: String }, 
      recordedAt: { type: Date, default: Date.now }
    }
  ],
  totalPaid: { type: Number, default: 0 }, 
  remainingAmount: { type: Number }, 

}, { timestamps: true })

export default mongoose.models.Invoice ||
mongoose.model("Invoice", invoiceSchema);
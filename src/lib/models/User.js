import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // From Google OAuth - you don't create these, Google sends them
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },


  businessName: { type: String },
  address: { type: String },
  country: { type: String },
  phone: { type: String },
  taxIdType: { type: String },
  taxIdNumber: { type: String },


  bankAccounts: [
    {
      label: { type: String },
      accountOwnerFirstName: { type: String },
      accountOwnerLastName: { type: String },
      bankName: { type: String },
      iban: { type: String },
      currency: { type: String },
      isDefault: { type: Boolean, default: false }
    }
  ],


  defaultCurrency: { type: String, default: 'USD' },
  defaultPaymentTerms: { type: Number, default: 30 }, // days until due
  invoicePrefix: { type: String, default: 'INV' }, // INV-001, INV-002
  nextInvoiceNumber: { type: Number, default: 1 }, // auto increment


  logo: { type: String },
  invoiceNotes: { type: String },


  stripeAccountId: { type: String },


  notifications: { type: Boolean, default: true },

}, { timestamps: true });

export default mongoose.models.Users ||
  mongoose.model("Users", userSchema);
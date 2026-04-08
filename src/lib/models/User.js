import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // From Google OAuth - you don't create these, Google sends them
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String }, // Google profile picture URL

  // Freelancer business info - user fills this after first login
  businessName: { type: String }, // if different from name
  address: { type: String },
  country: { type: String },
  phone: { type: String },
  taxIdType: { type: String },
  taxIdNumber: { type: String },

  // Payment & billing preferences
  bankAccounts: [
    {
      label: { type: String }, // "EUR Account" or "RSD Account"
      accountOwnerFirstName: { type: String },
      accountOwnerLastName: { type: String },
      bankName: { type: String },
      iban: { type: String },
      currency: { type: String },
      isDefault: { type: Boolean, default: false }
    }
  ],

  // Invoice preferences - auto-fill on every invoice
  defaultCurrency: { type: String, default: 'USD' },
  defaultPaymentTerms: { type: Number, default: 30 }, // days until due
  invoicePrefix: { type: String, default: 'INV' }, // INV-001, INV-002
  nextInvoiceNumber: { type: Number, default: 1 }, // auto increment

  // Branding
  logo: { type: String }, // uploaded image URL
  invoiceNotes: { type: String }, // default footer note on every invoice

  // Stripe
  stripeAccountId: { type: String }, // their connected Stripe account

  // User preferences
  notifications: { type: Boolean, default: true },

}, { timestamps: true });

export default mongoose.models.Users ||
  mongoose.model("Users", userSchema);
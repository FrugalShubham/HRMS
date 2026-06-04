import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  companyId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  pdfUrl?: string;
  lineItems: { description: string; amount: number }[];
}

const invoiceSchema = new Schema<IInvoice>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['draft', 'issued', 'paid', 'cancelled'],
      default: 'draft',
    },
    dueDate: { type: Date, required: true },
    paidAt: Date,
    pdfUrl: String,
    lineItems: [{ description: String, amount: Number }],
  },
  { timestamps: true }
);

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);

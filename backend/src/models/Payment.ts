import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  companyId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  provider: 'razorpay' | 'stripe';
  providerPaymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  invoiceId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
}

const paymentSchema = new Schema<IPayment>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    provider: { type: String, enum: ['razorpay', 'stripe'], required: true },
    providerPaymentId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
);

paymentSchema.index({ provider: 1, providerPaymentId: 1 }, { unique: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

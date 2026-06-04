import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  companyId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  startsAt: Date;
  expiresAt: Date;
  razorpaySubscriptionId?: string;
  stripeSubscriptionId?: string;
  autoRenew: boolean;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    status: {
      type: String,
      enum: ['trial', 'active', 'past_due', 'cancelled', 'expired'],
      default: 'trial',
    },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    razorpaySubscriptionId: String,
    stripeSubscriptionId: String,
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);

import mongoose, { Document, Schema } from 'mongoose';
import { CompanyFeatures } from '../types';

export interface IPlan extends Document {
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly?: number;
  currency: string;
  durationDays?: number;
  maxEmployees: number;
  features: CompanyFeatures;
  isCustom: boolean;
  isActive: boolean;
  sortOrder: number;
}

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    priceMonthly: { type: Number, required: true },
    priceYearly: Number,
    currency: { type: String, default: 'INR' },
    durationDays: Number,
    maxEmployees: { type: Number, required: true },
    features: { type: Schema.Types.Mixed, required: true },
    isCustom: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Plan = mongoose.model<IPlan>('Plan', planSchema);

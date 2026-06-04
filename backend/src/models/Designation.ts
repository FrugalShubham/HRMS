import mongoose, { Document, Schema } from 'mongoose';

export interface IDesignation extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  level?: number;
  description?: string;
  isActive: boolean;
}

const designationSchema = new Schema<IDesignation>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    level: Number,
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Designation = mongoose.model<IDesignation>('Designation', designationSchema);

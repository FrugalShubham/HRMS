import mongoose, { Document, Schema } from 'mongoose';

export interface IPayroll extends Document {
  companyId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  status: 'draft' | 'processing' | 'completed' | 'cancelled';
  employeeCount: number;
  totalGross: number;
  totalNet: number;
  generatedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
}

const payrollSchema = new Schema<IPayroll>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'processing', 'completed', 'cancelled'],
      default: 'draft',
    },
    employeeCount: { type: Number, default: 0 },
    totalGross: { type: Number, default: 0 },
    totalNet: { type: Number, default: 0 },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
  },
  { timestamps: true }
);

payrollSchema.index({ companyId: 1, year: 1, month: 1 }, { unique: true });

export const Payroll = mongoose.model<IPayroll>('Payroll', payrollSchema);

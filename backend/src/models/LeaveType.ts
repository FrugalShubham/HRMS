import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveType extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  annualQuota: number;
  carryForward: boolean;
  requiresApproval: boolean;
  isPaid: boolean;
  isActive: boolean;
}

const leaveTypeSchema = new Schema<ILeaveType>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    annualQuota: { type: Number, default: 0 },
    carryForward: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: true },
    isPaid: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

leaveTypeSchema.index({ companyId: 1, code: 1 }, { unique: true });

export const LeaveType = mongoose.model<ILeaveType>('LeaveType', leaveTypeSchema);

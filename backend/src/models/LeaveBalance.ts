import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveBalance extends Document {
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  leaveTypeId: mongoose.Types.ObjectId;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  carriedForward: number;
}

const leaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    year: { type: Number, required: true },
    allocated: { type: Number, default: 0 },
    used: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    carriedForward: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leaveBalanceSchema.index(
  { companyId: 1, employeeId: 1, leaveTypeId: 1, year: 1 },
  { unique: true }
);

export const LeaveBalance = mongoose.model<ILeaveBalance>('LeaveBalance', leaveBalanceSchema);

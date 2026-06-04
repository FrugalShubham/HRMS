import mongoose, { Document, Schema } from 'mongoose';
import { LeaveRequestStatus } from '../types';

export interface IApprovalStep {
  approverId: mongoose.Types.ObjectId;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  actedAt?: Date;
}

export interface ILeaveRequest extends Document {
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  leaveTypeId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveRequestStatus;
  approvalChain: IApprovalStep[];
  attachments?: string[];
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    leaveTypeId: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'manager_approved', 'hr_approved', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approvalChain: [
      {
        approverId: { type: Schema.Types.ObjectId, ref: 'User' },
        role: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'] },
        comment: String,
        actedAt: Date,
      },
    ],
    attachments: [String],
  },
  { timestamps: true }
);

leaveRequestSchema.index({ companyId: 1, status: 1 });
leaveRequestSchema.index({ companyId: 1, employeeId: 1 });

export const LeaveRequest = mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema);

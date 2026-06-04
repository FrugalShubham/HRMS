import mongoose from 'mongoose';
import { LeaveBalance, LeaveRequest, LeaveType, Employee } from '../models';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { LeaveRequestStatus } from '../types';

function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.ceil(ms / 86400000) + 1;
}

export async function createLeaveRequest(params: {
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}) {
  const leaveType = await LeaveType.findOne({
    _id: params.leaveTypeId,
    companyId: params.companyId,
    isActive: true,
  });
  if (!leaveType) throw new NotFoundError('Leave type not found');

  const days = daysBetween(params.startDate, params.endDate);
  if (days <= 0) throw new ValidationError('Invalid date range');

  const year = params.startDate.getFullYear();
  const balance = await LeaveBalance.findOne({
    companyId: params.companyId,
    employeeId: params.employeeId,
    leaveTypeId: params.leaveTypeId,
    year,
  });

  const available = (balance?.allocated ?? leaveType.annualQuota) - (balance?.used ?? 0) - (balance?.pending ?? 0);
  if (available < days) {
    throw new ValidationError(`Insufficient leave balance. Available: ${available} days`);
  }

  const employee = await Employee.findById(params.employeeId);
  const approvalChain: { approverId: mongoose.Types.ObjectId; role: string; status: string }[] = [];

  if (employee?.managerId) {
    const manager = await Employee.findById(employee.managerId).populate('userId');
    if (manager?.userId) {
      approvalChain.push({
        approverId: (manager.userId as mongoose.Types.ObjectId),
        role: 'team_manager',
        status: 'pending',
      });
    }
  }

  const request = await LeaveRequest.create({
    companyId: params.companyId,
    employeeId: params.employeeId,
    leaveTypeId: params.leaveTypeId,
    startDate: params.startDate,
    endDate: params.endDate,
    days,
    reason: params.reason,
    status: 'pending',
    approvalChain,
  });

  await LeaveBalance.findOneAndUpdate(
    { companyId: params.companyId, employeeId: params.employeeId, leaveTypeId: params.leaveTypeId, year },
    { $inc: { pending: days } },
    { upsert: true, setDefaultsOnInsert: true }
  );

  return request;
}

export async function approveLeave(params: {
  requestId: string;
  companyId: string;
  approverId: string;
  role: 'team_manager' | 'hr_manager' | 'company_admin';
  approved: boolean;
  comment?: string;
}) {
  const request = await LeaveRequest.findOne({ _id: params.requestId, companyId: params.companyId });
  if (!request) throw new NotFoundError('Leave request not found');

  const step = request.approvalChain.find(
    (s) => s.approverId.toString() === params.approverId && s.status === 'pending'
  );

  if (!step && params.role !== 'company_admin' && params.role !== 'hr_manager') {
    throw new ForbiddenError('Not authorized to approve this request');
  }

  if (!params.approved) {
    request.status = 'rejected';
    if (step) {
      step.status = 'rejected';
      step.comment = params.comment;
      step.actedAt = new Date();
    }
    await request.save();
    await LeaveBalance.updateOne(
      { companyId: params.companyId, employeeId: request.employeeId, leaveTypeId: request.leaveTypeId },
      { $inc: { pending: -request.days } }
    );
    return request;
  }

  if (step) {
    step.status = 'approved';
    step.comment = params.comment;
    step.actedAt = new Date();
  }

  if (params.role === 'team_manager') {
    request.status = 'manager_approved';
  } else {
    request.status = 'approved';
    await LeaveBalance.updateOne(
      {
        companyId: params.companyId,
        employeeId: request.employeeId,
        leaveTypeId: request.leaveTypeId,
        year: request.startDate.getFullYear(),
      },
      { $inc: { pending: -request.days, used: request.days } }
    );
  }

  await request.save();
  return request;
}

export async function getLeaveBalances(companyId: string, employeeId: string, year: number) {
  return LeaveBalance.find({ companyId, employeeId, year }).populate('leaveTypeId', 'name code');
}

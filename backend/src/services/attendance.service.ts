import mongoose from 'mongoose';
import { Attendance, Company, Employee } from '../models';
import { IAttendanceRecord } from '../models/Attendance';
import { AttendanceSource } from '../types';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { isWithinGeoFence } from '../utils/geo';

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function checkIn(params: {
  companyId: string;
  employeeId: string;
  source: AttendanceSource;
  record: Partial<IAttendanceRecord>;
}) {
  const company = await Company.findById(params.companyId);
  if (!company) throw new NotFoundError('Company not found');

  const employee = await Employee.findOne({
    _id: params.employeeId,
    companyId: params.companyId,
    status: 'active',
  });
  if (!employee) throw new NotFoundError('Employee not found');

  if (company.features.geoFencing && company.officeLocation?.coordinates) {
    const loc = params.record.location;
    if (!loc) throw new ValidationError('Location required for check-in');
    const within = isWithinGeoFence(
      loc,
      company.officeLocation.coordinates,
      company.settings.officeRadius
    );
    if (!within) throw new ForbiddenError('You are outside the office geo-fence');
  }

  if (company.settings.requirePhoto && !params.record.selfieUrl) {
    throw new ValidationError('Selfie photo is required for attendance');
  }

  const date = startOfDay();
  let attendance = await Attendance.findOne({
    companyId: params.companyId,
    employeeId: params.employeeId,
    date,
  });

  if (attendance?.checkIn) {
    throw new ValidationError('Already checked in today');
  }

  const checkIn: IAttendanceRecord = {
    time: new Date(),
    location: params.record.location,
    deviceInfo: params.record.deviceInfo,
    ipAddress: params.record.ipAddress,
    selfieUrl: params.record.selfieUrl,
  };

  const checkInHour = checkIn.time.getHours();
  const [expectedHour] = company.settings.checkInTime.split(':').map(Number);
  const status = checkInHour > expectedHour + 1 ? 'late' : 'present';

  if (attendance) {
    attendance.checkIn = checkIn;
    attendance.status = status as typeof attendance.status;
    attendance.source = params.source;
    await attendance.save();
  } else {
    attendance = await Attendance.create({
      companyId: params.companyId,
      employeeId: params.employeeId,
      date,
      checkIn,
      status,
      source: params.source,
    });
  }

  return attendance;
}

export async function checkOut(params: {
  companyId: string;
  employeeId: string;
  source: AttendanceSource;
  record: Partial<IAttendanceRecord>;
}) {
  const date = startOfDay();
  const attendance = await Attendance.findOne({
    companyId: params.companyId,
    employeeId: params.employeeId,
    date,
  });

  if (!attendance?.checkIn) {
    throw new ValidationError('Must check in before check out');
  }
  if (attendance.checkOut) {
    throw new ValidationError('Already checked out today');
  }

  attendance.checkOut = {
    time: new Date(),
    location: params.record.location,
    deviceInfo: params.record.deviceInfo,
    ipAddress: params.record.ipAddress,
  };

  const ms = attendance.checkOut.time.getTime() - attendance.checkIn.time.getTime();
  attendance.totalHours = Math.round((ms / 3600000) * 100) / 100;
  await attendance.save();
  return attendance;
}

export async function listAttendance(
  companyId: string,
  filters: { employeeId?: string; from?: Date; to?: Date; page?: number; limit?: number }
) {
  const query: Record<string, unknown> = { companyId: new mongoose.Types.ObjectId(companyId) };
  if (filters.employeeId) query.employeeId = filters.employeeId;
  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) (query.date as Record<string, Date>).$gte = filters.from;
    if (filters.to) (query.date as Record<string, Date>).$lte = filters.to;
  }

  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Attendance.find(query)
      .populate('employeeId', 'firstName lastName employeeNumber')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(query),
  ]);

  return { data, total, page, limit };
}

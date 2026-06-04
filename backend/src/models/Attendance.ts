import mongoose, { Document, Schema } from 'mongoose';
import { AttendanceSource, AttendanceStatus } from '../types';

export interface IAttendanceRecord {
  time: Date;
  location?: { latitude: number; longitude: number; accuracy?: number };
  deviceInfo?: { userAgent?: string; platform?: string; deviceId?: string };
  ipAddress?: string;
  selfieUrl?: string;
}

export interface IAttendance extends Document {
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: IAttendanceRecord;
  checkOut?: IAttendanceRecord;
  status: AttendanceStatus;
  source: AttendanceSource;
  notes?: string;
  totalHours?: number;
}

const recordSchema = new Schema(
  {
    time: { type: Date, required: true },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
      deviceId: String,
    },
    ipAddress: String,
    selfieUrl: String,
  },
  { _id: false }
);

const attendanceSchema = new Schema<IAttendance>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true },
    checkIn: recordSchema,
    checkOut: recordSchema,
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half_day', 'wfh'],
      default: 'present',
    },
    source: { type: String, enum: ['web', 'mobile', 'whatsapp'], default: 'web' },
    notes: String,
    totalHours: Number,
  },
  { timestamps: true }
);

attendanceSchema.index({ companyId: 1, employeeId: 1, date: -1 }, { unique: true });
attendanceSchema.index({ companyId: 1, date: -1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);

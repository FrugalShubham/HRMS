import { Types } from 'mongoose';

export type UserRole =
  | 'super_admin'
  | 'company_owner'
  | 'company_admin'
  | 'hr_manager'
  | 'team_manager'
  | 'employee';

export type CompanyStatus = 'active' | 'suspended' | 'pending' | 'deleted';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'wfh';
export type AttendanceSource = 'web' | 'mobile' | 'whatsapp';

export type LeaveRequestStatus =
  | 'pending'
  | 'manager_approved'
  | 'hr_approved'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface CompanyFeatures {
  attendance: boolean;
  leave: boolean;
  payroll: boolean;
  recruitment: boolean;
  whatsapp: boolean;
  aiAssistant: boolean;
  geoFencing: boolean;
  faceRecognition: boolean;
  performanceManagement: boolean;
  assetManagement: boolean;
  reports: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  companyId?: string;
  employeeId?: string;
}

export interface AuthRequestUser extends JwtPayload {
  _id: Types.ObjectId;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface DeviceInfo {
  userAgent?: string;
  platform?: string;
  deviceId?: string;
}

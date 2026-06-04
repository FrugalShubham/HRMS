export type UserRole =
  | 'super_admin'
  | 'company_owner'
  | 'company_admin'
  | 'hr_manager'
  | 'team_manager'
  | 'employee';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: string;
  employeeId?: string;
  avatarUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { total: number; page: number; limit: number };
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  status: string;
  employeeCount: number;
  features?: Record<string, boolean>;
}

export interface Employee {
  _id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId?: { name: string };
  designationId?: { name: string };
  status: string;
}

export interface Attendance {
  _id: string;
  date: string;
  status: string;
  checkIn?: { time: string };
  checkOut?: { time: string };
  source: string;
}

export interface Plan {
  _id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  maxEmployees: number;
  features: Record<string, boolean>;
}

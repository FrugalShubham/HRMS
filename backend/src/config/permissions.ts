import { UserRole } from '../types';

export const PERMISSIONS = {
  'platform.companies.create': ['super_admin'],
  'platform.companies.suspend': ['super_admin'],
  'platform.companies.activate': ['super_admin'],
  'platform.companies.delete': ['super_admin'],
  'platform.analytics': ['super_admin'],
  'platform.plans.manage': ['super_admin'],
  'platform.credits.manage': ['super_admin'],
  'platform.payments.manage': ['super_admin'],
  'company.settings': ['company_owner', 'company_admin'],
  'employees.create': ['company_owner', 'company_admin', 'hr_manager'],
  'employees.read': ['company_owner', 'company_admin', 'hr_manager', 'team_manager', 'employee'],
  'employees.update': ['company_owner', 'company_admin', 'hr_manager'],
  'employees.delete': ['company_owner', 'company_admin'],
  'departments.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'designations.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'attendance.read.all': ['company_owner', 'company_admin', 'hr_manager', 'team_manager'],
  'attendance.mark.self': ['company_owner', 'company_admin', 'hr_manager', 'team_manager', 'employee'],
  'leave.approve.manager': ['team_manager', 'company_admin', 'hr_manager'],
  'leave.approve.hr': ['company_admin', 'hr_manager'],
  'leave.request': ['company_owner', 'company_admin', 'hr_manager', 'team_manager', 'employee'],
  'leave.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'payroll.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'payroll.view.self': ['company_owner', 'company_admin', 'hr_manager', 'employee'],
  'recruitment.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'assets.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'holidays.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'announcements.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'shifts.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'performance.manage': ['company_owner', 'company_admin', 'hr_manager'],
  'reports.export': ['company_owner', 'company_admin', 'hr_manager', 'team_manager'],
  'ai.use': ['company_owner', 'company_admin', 'hr_manager'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission];
  return (allowed as readonly string[]).includes(role);
}

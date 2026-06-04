import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Wallet,
  Briefcase,
  Package,
  Megaphone,
  Building2,
  CreditCard,
  Bot,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { toggleSidebar } from '@/store/uiSlice';
import { UserRole } from '@/types';
import { FeatureKey, useFeatures } from '@/hooks/useFeatures';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  feature?: FeatureKey;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'company_owner', 'company_admin', 'hr_manager', 'team_manager', 'employee'] },
  { to: '/platform', label: 'Platform', icon: Building2, roles: ['super_admin'] },
  { to: '/employees', label: 'Employees', icon: Users, roles: ['company_owner', 'company_admin', 'hr_manager', 'team_manager'] },
  { to: '/attendance', label: 'Attendance', icon: Clock, roles: ['company_owner', 'company_admin', 'hr_manager', 'team_manager', 'employee'], feature: 'attendance' },
  { to: '/leave', label: 'Leave', icon: Calendar, roles: ['company_owner', 'company_admin', 'hr_manager', 'team_manager', 'employee'], feature: 'leave' },
  { to: '/payroll', label: 'Payroll', icon: Wallet, roles: ['company_owner', 'company_admin', 'hr_manager', 'employee'], feature: 'payroll' },
  { to: '/recruitment', label: 'Recruitment', icon: Briefcase, roles: ['company_owner', 'company_admin', 'hr_manager'], feature: 'recruitment' },
  { to: '/assets', label: 'Assets', icon: Package, roles: ['company_owner', 'company_admin', 'hr_manager'], feature: 'assetManagement' },
  { to: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['company_owner', 'company_admin', 'hr_manager', 'employee'] },
  { to: '/ai', label: 'AI Assistant', icon: Bot, roles: ['company_owner', 'company_admin', 'hr_manager'], feature: 'aiAssistant' },
  { to: '/billing', label: 'Billing', icon: CreditCard, roles: ['company_owner', 'company_admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['company_owner', 'company_admin'] },
];

export function Sidebar() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.sidebarOpen);
  const role = useAppSelector((s) => s.auth.user?.role);
  const { hasFeature } = useFeatures();

  const filtered = navItems.filter((item) => {
    if (!role || !item.roles.includes(role)) return false;
    if (item.feature && role !== 'super_admin' && !hasFeature(item.feature)) return false;
    return true;
  });

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 256 : 72 }}
      className="hidden md:flex flex-col border-r bg-card h-screen sticky top-0"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {open && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            HRFlow AI
          </motion.span>
        )}
        <button type="button" onClick={() => dispatch(toggleSidebar())} className="p-2 rounded-md hover:bg-muted">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', !open && 'rotate-180')} />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}

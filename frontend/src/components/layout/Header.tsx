import { Moon, Sun, LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { toggleTheme } from '@/store/themeSlice';
import { logout } from '@/store/authSlice';
import { apiClient } from '@/api/client';

export function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const theme = useAppSelector((s) => s.theme.mode);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <div className="md:hidden font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
        HRFlow AI
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        {user && (
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

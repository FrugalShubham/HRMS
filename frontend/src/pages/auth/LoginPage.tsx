import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/api/client';
import { useAppDispatch } from '@/hooks/redux';
import { setSession } from '@/store/authSlice';
import { User } from '@/types';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  otpCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function getDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('deviceId', id);
  }
  return id;
}

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [needs2fa, setNeeds2fa] = useState(false);
  const [devCode, setDevCode] = useState<string | undefined>();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'superadmin@hrflow.ai', password: 'SuperAdmin@123' },
  });

  const finishLogin = async (accessToken: string, user: User) => {
    let features: Record<string, boolean> | null = null;
    try {
      localStorage.setItem('accessToken', accessToken);
      const me = await apiClient.get('/auth/me');
      features = me.data.data?.company?.features ?? null;
      if (me.data.data?.user) user = me.data.data.user;
    } catch {
      /* ignore */
    }
    dispatch(setSession({ user, accessToken, companyFeatures: features }));
    navigate(user.role === 'super_admin' ? '/platform' : '/dashboard');
  };

  const login = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post('/auth/login', {
        ...data,
        deviceId: getDeviceId(),
        platform: navigator.platform,
      }),
    onSuccess: async (res) => {
      const data = res.data.data;
      if (data.requires2fa) {
        setNeeds2fa(true);
        setDevCode(data.devCode);
        return;
      }
      await finishLogin(data.accessToken, data.user);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-background to-indigo-50 dark:from-violet-950/30 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <Card className="shadow-xl border-0 ring-1 ring-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              HRFlow AI
            </CardTitle>
            <CardDescription>WhatsApp-first HRMS with AI automation</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
              </div>
              {needs2fa && (
                <div className="space-y-2">
                  <Label>2FA code</Label>
                  <Input {...register('otpCode')} placeholder="6-digit code" defaultValue={devCode} />
                  {devCode && <p className="text-xs text-muted-foreground">Dev code: {devCode}</p>}
                </div>
              )}
              {login.isError && (
                <p className="text-sm text-destructive text-center">
                  {(login.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed'}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? 'Signing in...' : needs2fa ? 'Verify & sign in' : 'Sign in'}
              </Button>
              <div className="flex justify-between text-sm">
                <Link to="/forgot-password" className="text-primary hover:underline">Forgot password?</Link>
                <Link to="/register" className="text-primary hover:underline">Start free trial</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

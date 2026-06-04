import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/api/client';

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export function SettingsPage() {
  const qc = useQueryClient();
  const [otpCode, setOtpCode] = useState('');

  const { data: company } = useQuery({
    queryKey: ['company-settings'],
    queryFn: () => apiClient.get('/company'),
  });

  const { data: devices } = useQuery({
    queryKey: ['devices'],
    queryFn: () => apiClient.get('/auth/devices'),
  });

  const { data: history } = useQuery({
    queryKey: ['login-history'],
    queryFn: () => apiClient.get('/auth/login-history'),
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const changePassword = useMutation({
    mutationFn: (d: z.infer<typeof passwordSchema>) => apiClient.post('/auth/change-password', d),
    onSuccess: () => passwordForm.reset(),
  });

  const enable2fa = useMutation({
    mutationFn: () => apiClient.post('/auth/2fa/enable'),
  });

  const resendVerify = useMutation({
    mutationFn: () => apiClient.post('/auth/resend-verification'),
  });

  const verifyEmail = useMutation({
    mutationFn: () => apiClient.post('/auth/verify-email', { code: otpCode }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth-me'] }),
  });

  const updateCompany = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiClient.patch('/company', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['company-settings'] }),
  });

  const c = company?.data?.data;

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Security, company profile, and preferences" />

      <Card>
        <CardHeader><CardTitle>Company profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company name</Label>
            <Input defaultValue={c?.name} id="companyName" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Require photo for attendance</Label>
              <Input
                type="checkbox"
                className="w-auto h-4"
                defaultChecked={c?.settings?.requirePhoto}
                onChange={(e) =>
                  updateCompany.mutate({ settings: { ...c?.settings, requirePhoto: e.target.checked } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Office radius (meters)</Label>
              <Input
                type="number"
                defaultValue={c?.settings?.officeRadius ?? 200}
                onBlur={(e) =>
                  updateCompany.mutate({ settings: { ...c?.settings, officeRadius: Number(e.target.value) } })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Email verification</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" onClick={() => resendVerify.mutate()} disabled={resendVerify.isPending}>
            Resend code
          </Button>
          <div className="flex gap-2">
            <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6-digit code" />
            <Button onClick={() => verifyEmail.mutate()} disabled={otpCode.length !== 6}>
              Verify
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Two-factor authentication</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={() => enable2fa.mutate()} disabled={enable2fa.isPending}>
            Enable 2FA (email OTP)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit((d) => changePassword.mutate(d))} className="space-y-4">
            <Input type="password" placeholder="Current password" {...passwordForm.register('currentPassword')} />
            <Input type="password" placeholder="New password" {...passwordForm.register('newPassword')} />
            <Button type="submit" disabled={changePassword.isPending}>Update password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Trusted devices</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          {(devices?.data?.data ?? []).map((d: { _id: string; deviceName?: string; platform?: string; lastActiveAt: string }) => (
            <div key={d._id} className="flex justify-between border-b py-2">
              <span>{d.deviceName ?? d.platform ?? 'Unknown device'}</span>
              <span className="text-muted-foreground">{new Date(d.lastActiveAt).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Login history</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2 max-h-48 overflow-y-auto">
          {(history?.data?.data ?? []).map((h: { _id: string; success: boolean; ipAddress?: string; createdAt: string }) => (
            <div key={h._id} className="flex justify-between border-b py-1">
              <span className={h.success ? 'text-emerald-600' : 'text-destructive'}>{h.success ? 'Success' : 'Failed'}</span>
              <span className="text-muted-foreground">{h.ipAddress} · {new Date(h.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

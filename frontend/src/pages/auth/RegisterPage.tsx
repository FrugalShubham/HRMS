import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/api/client';

const schema = z.object({
  companyName: z.string().min(2, 'Company name required'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
  ownerFirstName: z.string().min(1),
  ownerLastName: z.string().min(1),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8).regex(/[A-Z]/, 'Include uppercase').regex(/[0-9]/, 'Include number'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const companyName = watch('companyName');

  const [apiError, setApiError] = useState<string | null>(null);

  const registerTrial = useMutation({
    mutationFn: (data: FormData) => apiClient.post('/auth/register', data),
    onSuccess: (res) => {
      setApiError(null);
      navigate('/verify-email', {
        state: {
          email: res.data.data.user.email,
          devCode: res.data.data.verification?.devCode,
        },
      });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setApiError(err.response?.data?.message ?? 'Registration failed. Try a different company slug or email.');
    },
  });

  const suggestSlug = companyName
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-background to-indigo-50 dark:from-violet-950/30 p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Start your 14-day free trial</CardTitle>
            <CardDescription>Up to 10 employees · Attendance · Leave · Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => registerTrial.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input {...register('ownerFirstName')} />
                  {errors.ownerFirstName && <p className="text-sm text-destructive">{errors.ownerFirstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input {...register('ownerLastName')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Company name</Label>
                <Input {...register('companyName')} placeholder="Acme Technologies" />
              </div>
              <div className="space-y-2">
                <Label>Company URL slug</Label>
                <Input {...register('slug')} placeholder={suggestSlug || 'acme-tech'} />
                <p className="text-xs text-muted-foreground">acme-tech.hrflow.ai</p>
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Work email</Label>
                <Input type="email" {...register('ownerEmail')} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" {...register('ownerPassword')} />
                {errors.ownerPassword && <p className="text-sm text-destructive">{errors.ownerPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input {...register('phone')} />
              </div>
              {apiError && (
                <p className="text-sm text-destructive text-center">{apiError}</p>
              )}
              <Button type="submit" className="w-full" disabled={registerTrial.isPending}>
                {registerTrial.isPending ? 'Creating trial...' : 'Start free trial'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

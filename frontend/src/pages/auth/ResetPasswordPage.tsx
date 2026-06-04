import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/api/client';

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; devCode?: string } | null;

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: state?.email ?? '', code: state?.devCode ?? '', newPassword: '' },
  });

  const reset = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => apiClient.post('/auth/reset-password', data),
    onSuccess: () => navigate('/login'),
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => reset.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
            </div>
            <div className="space-y-2">
              <Label>Reset code</Label>
              <Input {...register('code')} maxLength={6} />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>New password</Label>
              <Input type="password" {...register('newPassword')} />
            </div>
            <Button type="submit" className="w-full" disabled={reset.isPending}>
              Reset password
            </Button>
            <Link to="/login" className="block text-center text-sm text-primary">Sign in</Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

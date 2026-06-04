import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/api/client';

const schema = z.object({ email: z.string().email() });

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const forgot = useMutation({
    mutationFn: (data: z.infer<typeof schema>) => apiClient.post('/auth/forgot-password', data),
    onSuccess: (res, vars) => {
      navigate('/reset-password', {
        state: { email: vars.email, devCode: res.data.data?.devCode },
      });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>We will send a 6-digit reset code to your email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => forgot.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={forgot.isPending}>
              Send reset code
            </Button>
            <Link to="/login" className="block text-center text-sm text-primary">Back to login</Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

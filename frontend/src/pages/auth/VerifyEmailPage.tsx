import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/api/client';
export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { email?: string; devCode?: string } | null;
  const [code, setCode] = useState(state?.devCode ?? '');

  const verify = useMutation({
    mutationFn: () =>
      apiClient.post('/auth/verify-email-public', {
        email: state?.email,
        code,
      }),
    onSuccess: () => navigate('/login', { state: { message: 'Email verified. Please sign in.' } }),
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Code sent to {state?.email ?? 'your email'}. Check inbox or use dev code in console.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" maxLength={6} />
          <Button className="w-full" onClick={() => verify.mutate()} disabled={verify.isPending || code.length !== 6}>
            Verify email
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            After verifying, <Link to="/login" className="text-primary">sign in</Link> to your new account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

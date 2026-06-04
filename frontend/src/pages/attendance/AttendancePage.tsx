import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api/client';
import { Attendance } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAppSelector } from '@/hooks/redux';

export function AttendancePage() {
  const qc = useQueryClient();
  const role = useAppSelector((s) => s.auth.user?.role);
  const isEmployee = role === 'employee';
  const endpoint = isEmployee ? '/attendance/my' : '/attendance';

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', endpoint],
    queryFn: () => apiClient.get<{ data: Attendance[] }>(endpoint),
  });

  const checkIn = useMutation({
    mutationFn: async () => {
      const location = await getLocation();
      return apiClient.post('/attendance/check-in', { location, deviceInfo: { userAgent: navigator.userAgent } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const checkOut = useMutation({
    mutationFn: () => apiClient.post('/attendance/check-out', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const records = data?.data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="GPS-validated check-in with WhatsApp support"
        action={
          isEmployee ? (
            <div className="flex gap-2">
              <Button onClick={() => checkIn.mutate()} disabled={checkIn.isPending}>Check In</Button>
              <Button variant="outline" onClick={() => checkOut.mutate()} disabled={checkOut.isPending}>Check Out</Button>
            </div>
          ) : undefined
        }
      />
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Source</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="p-4 text-muted-foreground">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-muted-foreground">No records</td></tr>
              ) : (
                records.map((a) => (
                  <tr key={a._id} className="border-b">
                    <td className="p-4">{formatDate(a.date)}</td>
                    <td className="p-4"><Badge>{a.status}</Badge></td>
                    <td className="p-4">{a.checkIn ? new Date(a.checkIn.time).toLocaleTimeString() : '—'}</td>
                    <td className="p-4 capitalize">{a.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

async function getLocation() {
  return new Promise<{ latitude: number; longitude: number } | undefined>((resolve) => {
    navigator.geolocation?.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => resolve(undefined)
    );
  });
}

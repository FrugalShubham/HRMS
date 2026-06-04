import { useQuery } from '@tanstack/react-query';
import { Users, Clock, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/api/client';
import { useAppSelector } from '@/hooks/redux';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const chartData = [
  { day: 'Mon', present: 42 },
  { day: 'Tue', present: 45 },
  { day: 'Wed', present: 40 },
  { day: 'Thu', present: 48 },
  { day: 'Fri', present: 44 },
];

export function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const qc = useQueryClient();
  const isEmployee = user?.role === 'employee';

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => apiClient.get('/employees?limit=1'),
    enabled: !isEmployee,
  });

  const checkIn = useMutation({
    mutationFn: async () => {
      const location = await getLocation();
      return apiClient.post('/attendance/check-in', {
        location,
        deviceInfo: { userAgent: navigator.userAgent, platform: navigator.platform },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.firstName}`}
        description="Your HR command center"
        action={
          isEmployee ? (
            <Button onClick={() => checkIn.mutate()} disabled={checkIn.isPending}>
              {checkIn.isPending ? 'Checking in...' : 'Check In'}
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {!isEmployee && (
          <StatCard title="Employees" value={employees?.data?.meta?.total ?? '—'} icon={Users} subtitle="Active workforce" />
        )}
        <StatCard title="Present Today" value="87%" icon={Clock} trend={{ value: 3.2, positive: true }} />
        <StatCard title="On Leave" value="6" icon={Calendar} />
        <StatCard title="Attendance Rate" value="94.2%" icon={TrendingUp} trend={{ value: 1.1, positive: true }} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

async function getLocation(): Promise<{ latitude: number; longitude: number } | undefined> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => resolve(undefined),
      { timeout: 10000 }
    );
  });
}

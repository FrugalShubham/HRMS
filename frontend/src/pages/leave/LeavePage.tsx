import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { formatDate } from '@/lib/utils';

export function LeavePage() {
  const { data: requests } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: () => apiClient.get('/leave/requests'),
  });

  const { data: balances } = useQuery({
    queryKey: ['leave-balances'],
    queryFn: () => apiClient.get('/leave/balances'),
  });

  return (
    <div>
      <PageHeader title="Leave Management" description="Request, approve, and track leave" action={<Button>Request Leave</Button>} />
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {(balances?.data?.data ?? []).map((b: { _id: string; leaveTypeId?: { name: string }; allocated: number; used: number }) => (
          <Card key={b._id}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{b.leaveTypeId?.name ?? 'Leave'}</p>
              <p className="text-2xl font-bold mt-1">{(b.allocated ?? 0) - (b.used ?? 0)} <span className="text-sm font-normal text-muted-foreground">days left</span></p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-4">Period</th>
                <th className="p-4">Days</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {(requests?.data?.data ?? []).map((r: { _id: string; startDate: string; endDate: string; days: number; status: string }) => (
                <tr key={r._id} className="border-b">
                  <td className="p-4">{formatDate(r.startDate)} — {formatDate(r.endDate)}</td>
                  <td className="p-4">{r.days}</td>
                  <td className="p-4"><Badge variant={r.status === 'approved' ? 'success' : 'warning'}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

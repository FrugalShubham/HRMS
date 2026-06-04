import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/utils';

export function PayrollPage() {
  const { data: payrolls } = useQuery({
    queryKey: ['payrolls'],
    queryFn: () => apiClient.get('/payroll'),
  });

  const { data: payslips } = useQuery({
    queryKey: ['payslips'],
    queryFn: () => apiClient.get('/payroll/payslips'),
  });

  return (
    <div>
      <PageHeader title="Payroll" description="Auto payroll generation and payslip delivery" action={<Button>Generate Payroll</Button>} />
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {(payrolls?.data?.data ?? []).slice(0, 4).map((p: { _id: string; month: number; year: number; status: string; totalNet: number }) => (
          <Card key={p._id}>
            <CardHeader>
              <CardTitle className="text-lg">{p.month}/{p.year}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(p.totalNet)}</p>
              <p className="text-sm text-muted-foreground capitalize mt-1">{p.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Payslips</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-4">Period</th>
                <th className="p-4">Gross</th>
                <th className="p-4">Net</th>
              </tr>
            </thead>
            <tbody>
              {(payslips?.data?.data ?? []).map((s: { _id: string; month: number; year: number; components: { gross: number; net: number } }) => (
                <tr key={s._id} className="border-b">
                  <td className="p-4">{s.month}/{s.year}</td>
                  <td className="p-4">{formatCurrency(s.components?.gross ?? 0)}</td>
                  <td className="p-4 font-medium">{formatCurrency(s.components?.net ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, IndianRupee, Activity } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { formatCurrency } from '@/lib/utils';
import { Company } from '@/types';
import { CreateCompanyDialog } from '@/components/platform/CreateCompanyDialog';

export function PlatformPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: analytics } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: () => apiClient.get('/platform/analytics'),
  });

  const { data: companies } = useQuery({
    queryKey: ['platform-companies'],
    queryFn: () => apiClient.get<{ data: Company[] }>('/platform/companies'),
  });

  const stats = analytics?.data?.data;

  return (
    <div>
      <PageHeader title="Platform Admin" description="Manage tenants, revenue, and subscriptions" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Companies" value={stats?.companies?.total ?? 0} icon={Building2} subtitle={`${stats?.companies?.active ?? 0} active`} />
        <StatCard title="Employees" value={stats?.employees ?? 0} icon={Users} />
        <StatCard title="Revenue" value={formatCurrency(stats?.revenue ?? 0)} icon={IndianRupee} />
        <StatCard title="Active Users (24h)" value={stats?.activeUsers24h ?? 0} icon={Activity} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Companies</CardTitle>
          <Button size="sm" onClick={() => setShowCreate(true)}>Create Company</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Slug</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Employees</th>
                </tr>
              </thead>
              <tbody>
                {(companies?.data?.data ?? []).map((c) => (
                  <tr key={c._id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.slug}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={c.status === 'active' ? 'success' : 'warning'}>{c.status}</Badge>
                    </td>
                    <td className="py-3">{c.employeeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {showCreate && <CreateCompanyDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}

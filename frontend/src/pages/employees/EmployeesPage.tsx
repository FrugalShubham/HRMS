import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { Employee } from '@/types';
import { Plus } from 'lucide-react';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';

export function EmployeesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => apiClient.get<{ data: Employee[] }>('/employees'),
  });

  const employees = data?.data?.data ?? [];

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage your workforce"
        action={<Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-2" />Add Employee</Button>}
      />
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-muted-foreground">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e._id} className="border-b hover:bg-muted/30">
                    <td className="p-4 font-mono text-xs">{e.employeeNumber}</td>
                    <td className="p-4 font-medium">{e.firstName} {e.lastName}</td>
                    <td className="p-4 text-muted-foreground">{e.email}</td>
                    <td className="p-4">{e.departmentId?.name ?? '—'}</td>
                    <td className="p-4"><Badge variant={e.status === 'active' ? 'success' : 'secondary'}>{e.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {showAdd && <EmployeeFormDialog onClose={() => setShowAdd(false)} />}
    </div>
  );
}

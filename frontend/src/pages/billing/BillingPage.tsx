import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/api/client';
import { Plan } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function BillingPage() {
  const { data } = useQuery({
    queryKey: ['plans'],
    queryFn: () => apiClient.get<{ data: Plan[] }>('/billing/plans'),
  });

  const plans = (data?.data?.data ?? []).filter((p) => p.slug !== 'enterprise');

  return (
    <div>
      <PageHeader title="Subscription Plans" description="Scale your HR operations with HRFlow AI" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, i) => (
          <motion.div key={plan._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn(plan.slug === 'professional' && 'ring-2 ring-primary')}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>Up to {plan.maxEmployees} employees</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {plan.priceMonthly === 0 ? 'Free' : formatCurrency(plan.priceMonthly)}
                  {plan.priceMonthly > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {Object.entries(plan.features)
                    .filter(([, v]) => v)
                    .slice(0, 5)
                    .map(([k]) => (
                      <li key={k} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.slug === 'professional' ? 'default' : 'outline'}>
                  {plan.priceMonthly === 0 ? 'Start Trial' : 'Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

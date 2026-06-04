import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/api/client';

const schema = z.object({
  employeeNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  whatsappNumber: z.string().optional(),
  joinDate: z.string(),
  password: z.string().min(8).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
}

export function EmployeeFormDialog({ onClose }: Props) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { joinDate: new Date().toISOString().slice(0, 10) },
  });

  const create = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post('/employees', { ...data, joinDate: new Date(data.joinDate) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold">Add employee</h2>
        <form onSubmit={handleSubmit((d) => create.mutate(d))} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Employee #</Label><Input {...register('employeeNumber')} /></div>
            <div><Label>Join date</Label><Input type="date" {...register('joinDate')} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="First name" {...register('firstName')} />
            <Input placeholder="Last name" {...register('lastName')} />
          </div>
          <Input type="email" placeholder="Email" {...register('email')} />
          <Input placeholder="Phone" {...register('phone')} />
          <Input placeholder="WhatsApp number" {...register('whatsappNumber')} />
          <Input type="password" placeholder="Portal password (optional)" {...register('password')} />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

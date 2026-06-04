import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/api/client';

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8),
  ownerFirstName: z.string(),
  ownerLastName: z.string(),
  planSlug: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
}

export function CreateCompanyDialog({ onClose }: Props) {
  const qc = useQueryClient();
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { planSlug: 'starter' },
  });

  const create = useMutation({
    mutationFn: (data: FormData) => apiClient.post('/platform/companies', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-companies'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg border shadow-lg w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold">Create company</h2>
        <form onSubmit={handleSubmit((d) => create.mutate(d))} className="space-y-3">
          <div className="space-y-1">
            <Label>Company name</Label>
            <Input {...register('name')} />
          </div>
          <div className="space-y-1">
            <Label>Slug</Label>
            <Input {...register('slug')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Owner first" {...register('ownerFirstName')} />
            <Input placeholder="Owner last" {...register('ownerLastName')} />
          </div>
          <Input type="email" placeholder="Owner email" {...register('ownerEmail')} />
          <Input type="password" placeholder="Owner password" {...register('ownerPassword')} />
          <Input placeholder="Plan slug (starter)" {...register('planSlug')} />
          {create.isError && <p className="text-sm text-destructive">Failed to create company</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

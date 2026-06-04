import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Module UI scaffold ready — connect to API endpoints for full CRUD.
        </CardContent>
      </Card>
    </div>
  );
}

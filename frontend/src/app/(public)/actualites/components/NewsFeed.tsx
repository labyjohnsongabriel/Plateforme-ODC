import { Newspaper } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

export function NewsFeed() {
  return (
    <EmptyState
      icon={Newspaper}
      title="Aucune actualité publiée"
      description="Les actualités apparaîtront ici dès qu'elles seront publiées."
    />
  );
}

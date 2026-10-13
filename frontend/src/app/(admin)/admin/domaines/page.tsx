import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DomainesTable } from './components/DomainesTable';

export const metadata: Metadata = { title: 'Domaines' };

export default function DomainesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Domaines</h1>
          <p className="text-odc-muted mt-1">
            Catégories de formations
          </p>
        </div>
        <Button variant="odc" asChild>
          <Link href="/admin/domaines/nouveau">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau domaine
          </Link>
        </Button>
      </header>

      <DomainesTable />
    </div>
  );
}
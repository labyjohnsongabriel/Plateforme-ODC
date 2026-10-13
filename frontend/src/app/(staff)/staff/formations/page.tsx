import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormationsTable } from './components/FormationsTable';

export const metadata: Metadata = { title: 'Formations' };

export default function StaffFormationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Formations</h1>
          <p className="text-odc-muted mt-1">Gérez le catalogue des formations</p>
        </div>
        <Button variant="odc" asChild>
          <Link href="/staff/formations/nouveau">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle formation
          </Link>
        </Button>
      </header>

      <FormationsTable />
    </div>
  );
}
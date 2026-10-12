import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartnersTable } from './components/PartnersTable';

export const metadata: Metadata = { title: 'Partenaires' };

export default function PartenairesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Partenaires
          </h1>
          <p className="text-odc-muted mt-1">
            Gérez les partenaires de l&apos;ODC
          </p>
        </div>
        <Button variant="odc" asChild>
          <Link href="/admin/partenaires/nouveau">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau partenaire
          </Link>
        </Button>
      </header>

      <PartnersTable />
    </div>
  );
}
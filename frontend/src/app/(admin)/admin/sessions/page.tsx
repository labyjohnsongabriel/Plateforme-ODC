import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionsTable } from './components/SessionsTable';
import { SessionStats } from './components/SessionStats';

export const metadata: Metadata = { title: 'Sessions' };

export default function SessionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Sessions</h1>
          <p className="text-odc-muted mt-1">
            Gérez le planning des sessions de formation
          </p>
        </div>
        <Button variant="odc" asChild>
          <Link href="/admin/sessions/nouveau">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle session
          </Link>
        </Button>
      </header>

      <SessionStats />
      <SessionsTable />
    </div>
  );
}
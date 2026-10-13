import type { Metadata } from 'next';
import { UsersTable } from './components/UsersTable';
import { UserFilters } from './components/UserFilters';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';


export default function UsersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Utilisateurs
          </h1>
          <p className="text-odc-muted mt-1">
            Gérez les comptes et les rôles des utilisateurs
          </p>
        </div>

        <Button variant="odc" asChild>
          <Link href="/admin/utilisateurs?action=new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel utilisateur
          </Link>
        </Button>
      </header>

      <UserFilters />
      <UsersTable />
    </div>
  );
}
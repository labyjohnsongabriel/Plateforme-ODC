import type { Metadata } from 'next';
import { RolesTable } from './components/RolesTable';

export const metadata: Metadata = {
  title: 'Rôles & Permissions',
};

export default function RolesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Rôles & Permissions
        </h1>
        <p className="text-odc-muted mt-1">
          Gérez les rôles et attribuez les permissions
        </p>
      </header>

      <RolesTable />
    </div>
  );
}
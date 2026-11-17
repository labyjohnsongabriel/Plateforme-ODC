// src/app/admin/profil/page.tsx
import type { Metadata } from 'next';
import { AdminProfileContent } from './components/AdminProfileContent';

export const metadata: Metadata = { title: 'Mon profil — Administrateur' };

export default function AdminProfilePage() {
  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
          Mon profil
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </header>

      <AdminProfileContent />
    </div>
  );
}
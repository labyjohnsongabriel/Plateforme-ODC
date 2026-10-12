// src/app/(admin)/admin/utilisateurs/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { UserForm } from '../components/UserForm';

interface Props {
  params: { id: string };
}

export const metadata: Metadata = {
  title: 'Modifier un utilisateur',
  description: 'Mettre à jour les informations du compte',
};

export default function EditUtilisateurPage({ params }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d'Ariane" className="text-sm text-odc-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/admin/dashboard"
              className="hover:text-odc-primary transition-colors"
            >
              Admin
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          </li>
          <li>
            <Link
              href="/admin/utilisateurs"
              className="hover:text-odc-primary transition-colors"
            >
              Utilisateurs
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          </li>
          <li className="text-odc-text-primary font-medium">Modifier</li>
        </ol>
      </nav>

      {/* Formulaire */}
      <UserForm mode="edit" userId={params.id} />
    </div>
  );
}
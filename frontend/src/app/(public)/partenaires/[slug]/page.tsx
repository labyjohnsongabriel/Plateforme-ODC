// src/app/(public)/partenaires/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PartenaireDetail } from './components/PartenaireDetail';
import { getPartenaireBySlug } from '@/lib/partenaires';

/* ═══════════════════════════════════════════════════════════════════════════
   MÉTADONNÉES DYNAMIQUES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const partenaire = await getPartenaireBySlug(params.slug);
    if (!partenaire) return { title: 'Partenaire introuvable' };

    return {
      title: `${partenaire.nom} — Partenaire ODC Madagascar`,
      description:
        partenaire.description ??
        `Découvrez ${partenaire.nom}, partenaire de l'Orange Digital Center Madagascar.`,
      openGraph: {
        title: `${partenaire.nom} — Partenaire ODC Madagascar`,
        description: partenaire.description ?? '',
        type: 'profile',
        locale: 'fr_MG',
      },
    };
  } catch {
    return { title: 'Partenaire — ODC Madagascar' };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default async function PartenairePage({ params }: Props) {
  let partenaire = null;

  try {
    partenaire = await getPartenaireBySlug(params.slug);
  } catch {
    // Erreur API
  }

  if (!partenaire) {
    notFound();
  }

  return <PartenaireDetail partenaire={partenaire} />;
}
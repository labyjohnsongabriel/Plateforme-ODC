import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PartenaireDetail } from './components/PartenaireDetail';

interface Props {
  params: { slug: string };
}

async function getPartenaire(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/partenaires/${slug}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const partenaire = await getPartenaire(params.slug);
  if (!partenaire) return { title: 'Partenaire introuvable' };
  return { title: partenaire.nom, description: partenaire.description };
}

export default async function PartenairePage({ params }: Props) {
  const partenaire = await getPartenaire(params.slug);
  if (!partenaire) notFound();
  return <PartenaireDetail partenaire={partenaire} />;
}
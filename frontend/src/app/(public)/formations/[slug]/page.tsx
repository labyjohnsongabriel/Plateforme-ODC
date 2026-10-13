import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FormationDetail } from './components/FormationDetail';

interface Props {
  params: { slug: string };
}

async function getFormation(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/formations/${slug}`,
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
  const formation = await getFormation(params.slug);
  if (!formation) return { title: 'Formation introuvable' };

  return {
    title: formation.titre,
    description: formation.description?.slice(0, 160),
    openGraph: {
      title: formation.titre,
      description: formation.description?.slice(0, 160),
      images: formation.imageUrl ? [formation.imageUrl] : [],
    },
  };
}

export default async function FormationDetailPage({ params }: Props) {
  const formation = await getFormation(params.slug);
  if (!formation) notFound();

  return <FormationDetail formation={formation} />;
}
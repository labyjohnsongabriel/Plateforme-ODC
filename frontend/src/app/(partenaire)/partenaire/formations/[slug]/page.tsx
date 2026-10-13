import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FormationDetail } from '@/app/(public)/formations/[slug]/components/FormationDetail';

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
  return { title: formation.titre };
}

export default async function PartenaireFormationDetailPage({ params }: Props) {
  const formation = await getFormation(params.slug);
  if (!formation) notFound();
  return <FormationDetail formation={formation} />;
}
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DomaineDetail } from './components/DomaineDetail';

interface Props {
  params: { slug: string };
}

async function getDomaine(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/domaines/${slug}`,
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
  const domaine = await getDomaine(params.slug);
  if (!domaine) return { title: 'Domaine introuvable' };
  return { title: domaine.nom, description: domaine.description };
}

export default async function DomainePage({ params }: Props) {
  const domaine = await getDomaine(params.slug);
  if (!domaine) notFound();
  return <DomaineDetail domaine={domaine} />;
}
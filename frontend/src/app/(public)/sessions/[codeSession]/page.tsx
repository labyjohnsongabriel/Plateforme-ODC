import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SessionDetail } from './components/SessionDetail';

interface Props {
  params: { codeSession: string };
}

async function getSession(code: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/sessions/${code}`,
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
  const session = await getSession(params.codeSession);
  if (!session) return { title: 'Session introuvable' };
  return {
    title: `Session ${session.codeSession} — ${session.formation?.titre}`,
  };
}

export default async function SessionDetailPage({ params }: Props) {
  const session = await getSession(params.codeSession);
  if (!session) notFound();
  return <SessionDetail session={session} />;
}
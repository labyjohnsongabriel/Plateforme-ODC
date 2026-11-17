// src/app/(participant)/participant/reseau/demandes/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox, Send } from 'lucide-react';
// ⭐ CORRECTION : '../components/' au lieu de './components/'
import { PendingRequestsList } from '../components/PendingRequestsList';
import { SentRequestsList } from '../components/SentRequestsList';

export default function DemandesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get('tab') === 'envoyees' ? 'envoyees' : 'recues';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`/participant/reseau/demandes?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Demandes de connexion
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gérez vos demandes de connexion reçues et envoyées
        </p>
      </header>

      <Tabs
        value={initialTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="recues" className="gap-2">
            <Inbox className="h-4 w-4" aria-hidden="true" />
            Reçues
          </TabsTrigger>
          <TabsTrigger value="envoyees" className="gap-2">
            <Send className="h-4 w-4" aria-hidden="true" />
            Envoyées
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recues" className="mt-6">
          <PendingRequestsList />
        </TabsContent>
        <TabsContent value="envoyees" className="mt-6">
          <SentRequestsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
// src/app/(participant)/participant/messagerie/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { ConversationList } from './components/ConversationList';
import { ChatModal } from './components/ChatModal';

/* ═══════════════════════════════════════════════════════════════════════════
   CONTENU — utilise useSearchParams (protégé par Suspense)
   ═══════════════════════════════════════════════════════════════════════════ */

function MessagerieContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeChatId = searchParams.get('chat');

  const openChat = (id: string) => {
    router.push(`${pathname}?chat=${id}`, { scroll: false });
  };

  const closeChat = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      {/* En-tête de page */}
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Messagerie
          </h1>
          <p className="text-sm text-muted-foreground">
            Échangez avec les membres de la communauté ODC
          </p>
        </div>
      </header>

      {/* Liste des conversations */}
      <ConversationList onOpenChat={openChat} />

      {/* Modale de chat (s'ouvre automatiquement si ?chat=xxx) */}
      {activeChatId && (
        <ChatModal
          conversationId={activeChatId}
          onClose={closeChat}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE — avec Suspense (obligatoire pour useSearchParams)
   ═══════════════════════════════════════════════════════════════════════════ */

export default function MessageriePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Chargement de la messagerie…</p>
          </div>
        </div>
      }
    >
      <MessagerieContent />
    </Suspense>
  );
}
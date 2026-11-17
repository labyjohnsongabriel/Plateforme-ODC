// src/components/messagerie/MessagerieModal.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  MessageSquare,
  X,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConversationList } from './ConversationList';
import { ChatView } from './ChatView';
import { useMessagerieModalStore } from '@/store/messagerie-modal.store';
import { cn } from '@/lib/utils';

export function MessagerieModal() {
  const { isOpen, close, conversationId, setConversation } =
    useMessagerieModalStore();
  const router = useRouter();
  const pathname = usePathname();

  /* ═══════════════════════════════════════════════════════════════════════
     Nettoyer l'URL quand on ferme
     ═══════════════════════════════════════════════════════════════════════ */
  const handleClose = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('chat')) {
      params.delete('chat');
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    }
    close();
  };

  /* ═══════════════════════════════════════════════════════════════════════
     Synchroniser l'URL quand on change de conversation
     ═══════════════════════════════════════════════════════════════════════ */
  const handleSelectConversation = (id: string | null) => {
    setConversation(id);
    if (id) {
      router.replace(`${pathname}?chat=${encodeURIComponent(id)}`, { scroll: false });
    } else {
      router.replace(pathname, { scroll: false });
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     Fermer sur Échap
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className={cn(
          'p-0 gap-0 overflow-hidden',
          'w-[95vw] max-w-6xl h-[88vh]',
          'sm:rounded-2xl',
          '[&>button]:hidden', // cache le X par défaut (on a le nôtre)
        )}
        aria-describedby={undefined}
      >
        {/* Titre accessible (caché) */}
        <DialogTitle className="sr-only">Messagerie</DialogTitle>

        {/* ═══ HEADER de la modale ═══ */}
        <header className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/5 to-transparent px-4 py-3 shrink-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-semibold text-base leading-tight">
              Messagerie
            </h2>
            <p className="text-xs text-muted-foreground">
              Échangez avec la communauté ODC
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Fermer la messagerie"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* ═══ CORPS : 2 colonnes desktop ═══ */}
        <div className="flex flex-1 min-h-0">
          {/* Colonne gauche : liste (masquée sur mobile quand chat ouvert) */}
          <aside
            className={cn(
              'w-full shrink-0 border-r bg-muted/20 flex flex-col min-h-0',
              'lg:w-[340px]',
              conversationId ? 'hidden lg:flex' : 'flex',
            )}
          >
            <ConversationList
              activeId={conversationId}
              onSelect={(id) => handleSelectConversation(id)}
            />
          </aside>

          {/* Colonne droite : chat (masquée sur mobile quand pas de chat) */}
          <section
            className={cn(
              'flex-1 flex flex-col min-h-0 min-w-0',
              conversationId ? 'flex' : 'hidden lg:flex',
            )}
          >
            {conversationId ? (
              <ChatView
                conversationId={conversationId}
                onBack={() => handleSelectConversation(null)}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-7 w-7 text-primary" aria-hidden />
                </div>
                <p className="font-display font-semibold text-foreground">
                  Sélectionnez une conversation
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Choisissez une conversation dans la liste pour commencer à
                  discuter, ou créez-en une nouvelle.
                </p>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
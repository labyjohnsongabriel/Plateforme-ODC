// src/components/messagerie/MessagerieProvider.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessagerieModal } from './MessagerieModal';
import { useMessagerieModalStore } from '@/store/messagerie-modal.store';

/**
 * Provider à monter une seule fois dans le root layout.
 * - Affiche la modale quand isOpen = true
 * - Ouvre la modale automatiquement si ?chat=<id> dans l'URL
 */
export function MessagerieProvider() {
  const searchParams = useSearchParams();
  const { isOpen, open } = useMessagerieModalStore();

  // Deep-link : ?chat=<id> ouvre la modale
  useEffect(() => {
    const chat = searchParams?.get('chat');
    if (chat) {
      open(chat);
    }
  }, [searchParams, open]);

  if (!isOpen) return null;

  return <MessagerieModal />;
}
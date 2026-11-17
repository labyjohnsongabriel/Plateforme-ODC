// src/components/inscription/InscriptionModalProvider.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { PublicInscriptionModal } from './PublicInscriptionModal';

/* ═══════════════════════════════════════════════════════════════════════════
   CONTEXTE
   ═══════════════════════════════════════════════════════════════════════════ */

interface InscriptionModalContextValue {
  open: (opts?: { sessionId?: string; formationId?: string }) => void;
  close: () => void;
  isOpen: boolean;
}

const InscriptionModalContext =
  createContext<InscriptionModalContextValue | null>(null);

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER
   ═══════════════════════════════════════════════════════════════════════════ */

export function InscriptionModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [formationId, setFormationId] = useState<string | undefined>();

  const open = (opts?: { sessionId?: string; formationId?: string }) => {
    setSessionId(opts?.sessionId);
    setFormationId(opts?.formationId);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSessionId(undefined);
      setFormationId(undefined);
    }, 300);
  };

  return (
    <InscriptionModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      <PublicInscriptionModal
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultSessionId={sessionId}
        formationId={formationId}
      />
    </InscriptionModalContext.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════════════════════════════════════ */

export function useInscriptionModal() {
  const ctx = useContext(InscriptionModalContext);
  if (!ctx) {
    throw new Error(
      'useInscriptionModal must be used within InscriptionModalProvider',
    );
  }
  return ctx;
}
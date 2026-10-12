'use client';

import { ReactNode } from 'react';

/**
 * Layout commun minimal.
 * Les pages de cette zone utilisent déjà le layout de leur rôle parent.
 * Ce layout sert uniquement de conteneur visuel pour les pages communes.
 */
export default function CommonLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
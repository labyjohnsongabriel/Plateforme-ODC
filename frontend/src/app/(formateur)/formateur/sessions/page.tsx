// src/app/(formateur)/formateur/sessions/page.tsx
import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { MySessionsList } from './components/MySessionsList';

export const metadata: Metadata = { title: 'Mes sessions' };

export default function FormateurSessionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/20">
            <Calendar
              className="h-6 w-6 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Mes sessions
            </h1>
            <p className="mt-1 text-muted-foreground">
              Consultez et gérez vos sessions de formation
            </p>
          </div>
        </div>
      </header>

      <MySessionsList />
    </div>
  );
}
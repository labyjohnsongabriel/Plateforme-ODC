// src/app/(staff)/staff/sessions/page.tsx
import type { Metadata } from 'next';
import { SessionsTable } from './components/SessionsTable';

export const metadata: Metadata = { title: 'Sessions — Staff' };

export default function StaffSessionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SessionsTable />
    </div>
  );
}
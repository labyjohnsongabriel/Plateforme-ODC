import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormationsTable } from './components/FormationsTable';

export const metadata: Metadata = { title: 'Formations' };

export default function FormationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">

      <FormationsTable />
    </div>
  );
}
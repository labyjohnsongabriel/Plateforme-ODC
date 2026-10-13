import type { Metadata } from 'next';
import { SuggestionsGrid } from '../components/SuggestionsGrid';

export const metadata: Metadata = { title: 'Suggestions' };

export default function SuggestionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Suggestions
        </h1>
        <p className="text-odc-muted mt-1">
          Membres que vous pourriez connaître
        </p>
      </header>
      <SuggestionsGrid />
    </div>
  );
}
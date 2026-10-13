'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';

export function AuditLogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('action') ?? '');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('action', debouncedSearch);
    else params.delete('action');
    params.delete('page');
    router.push(`/admin/audit-logs?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, router, searchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') params.delete(key);
    else params.set(key, value);
    params.delete('page');
    router.push(`/admin/audit-logs?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    setSearch('');
    router.push('/admin/audit-logs');
  };

  const hasFilters =
    !!searchParams.get('action') ||
    !!searchParams.get('entite') ||
    !!searchParams.get('dateDebut');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <Label htmlFor="action" className="text-xs">
              Action
            </Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-odc-muted pointer-events-none" />
              <Input
                id="action"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une action..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="w-[180px]">
            <Label htmlFor="entite" className="text-xs">
              Entité
            </Label>
            <Input
              id="entite"
              value={searchParams.get('entite') ?? ''}
              onChange={(e) => updateParam('entite', e.target.value)}
              placeholder="User, Formation…"
              className="mt-1.5"
            />
          </div>

          <div className="w-[160px]">
            <Label htmlFor="dateDebut" className="text-xs">
              Depuis
            </Label>
            <Input
              id="dateDebut"
              type="date"
              value={searchParams.get('dateDebut') ?? ''}
              onChange={(e) => updateParam('dateDebut', e.target.value)}
              className="mt-1.5"
            />
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X className="h-4 w-4 mr-1.5" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
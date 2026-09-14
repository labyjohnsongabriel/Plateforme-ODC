import { useEffect, useState } from 'react';
import { FormationService } from '../services/formation.service';
import type { Formation } from '../types/formation.types';

export function useFormationDetail(id?: string) {
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await FormationService.getById(id);
        setFormation(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Formation introuvable');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return { formation, loading, error };
}
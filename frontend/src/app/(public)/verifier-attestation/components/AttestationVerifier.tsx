'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Award, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';

interface VerificationResult {
  numero: string;
  dateEmission: string;
  participant: string;
  formation: string;
  noteFinale: number;
  tauxPresence: number;
}

export function AttestationVerifier() {
  const searchParams = useSearchParams();
  const [numero, setNumero] = useState(searchParams.get('numero') ?? '');
  const [submittedNumero, setSubmittedNumero] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['attestation', 'verify', submittedNumero],
    queryFn: async () => {
      const { data } = await api.get(
        `/public/attestations/verifier/${submittedNumero}`,
      );
      return data.data as VerificationResult;
    },
    enabled: !!submittedNumero,
    retry: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim()) return;
    setSubmittedNumero(numero.trim());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-odc-primary" />
            Vérifier une attestation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="numero">Numéro de l&apos;attestation</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="numero"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ex: ODC-ATT-2025-000123"
                  className="flex-1"
                />
                <Button type="submit" variant="odc" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Vérifier
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {submittedNumero && !isLoading && (
        <>
          {isError ? (
            <Card className="border-odc-error">
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-odc-error-bg flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-odc-error" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  Attestation invalide
                </h3>
                <p className="text-odc-muted text-sm">
                  Aucune attestation ne correspond au numéro{' '}
                  <strong>{submittedNumero}</strong>.
                </p>
              </CardContent>
            </Card>
          ) : data ? (
            <Card className="border-green-500">
              <CardContent className="py-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1">
                    Attestation authentique
                  </h3>
                  <p className="text-xs text-odc-muted">
                    Vérifiée le {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-odc-border">
                  <InfoRow label="Numéro" value={data.numero} />
                  <InfoRow
                    label="Date d'émission"
                    value={formatDate(data.dateEmission)}
                  />
                  <InfoRow label="Participant" value={data.participant} />
                  <InfoRow label="Formation" value={data.formation} />
                  <InfoRow label="Note finale" value={`${data.noteFinale}/20`} />
                  <InfoRow label="Taux de présence" value={`${data.tauxPresence}%`} />
                </div>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-odc-muted mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
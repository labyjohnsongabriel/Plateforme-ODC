'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, ClipboardCheck, Clock, Calendar, Send, CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';

export function EvaluationDetail({ evaluationId }: { evaluationId: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [soumission, setSoumission] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: evaluation, isLoading } = useQuery({
    queryKey: ['participant', 'evaluation', evaluationId],
    queryFn: async () => {
      const { data } = await api.get(`/participant/evaluations/${evaluationId}`);
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post(
        `/participant/evaluations/${evaluationId}/soumettre`,
        { reponses: { contenu: soumission } },
      );
    },
    onSuccess: () => {
      toast.success('Évaluation soumise avec succès');
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ['participant', 'evaluations'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading || !evaluation) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Évaluation soumise !</h2>
          <p className="text-odc-muted mb-6">
            Votre évaluation a bien été transmise. Vous recevrez votre note dès
            qu&apos;elle sera corrigée.
          </p>
          <Button variant="odc" onClick={() => router.push('/participant/evaluations')}>
            Retour aux évaluations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 mb-2">
            <Badge className="bg-odc-primary-soft text-odc-primary">
              {evaluation.type}
            </Badge>
            <span className="text-sm text-odc-muted">{evaluation.noteMax} points</span>
          </div>
          <CardTitle className="text-2xl">{evaluation.titre}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 text-sm text-odc-muted pb-4 border-b border-odc-border">
            {evaluation.dateEvaluation && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(evaluation.dateEvaluation)}
              </span>
            )}
            {evaluation.dureeMinutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {evaluation.dureeMinutes} minutes
              </span>
            )}
          </div>

          {evaluation.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-odc-secondary whitespace-pre-line">
                {evaluation.description}
              </p>
            </div>
          )}

          {evaluation.consignes && (
            <div className="p-4 rounded-lg bg-odc-info-bg">
              <h3 className="font-medium text-odc-info mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Consignes
              </h3>
              <p className="text-sm whitespace-pre-line">{evaluation.consignes}</p>
            </div>
          )}

          {/* Formulaire de soumission */}
          <div className="pt-4 border-t border-odc-border">
            <h3 className="font-medium mb-2">Votre réponse</h3>
            <Textarea
              value={soumission}
              onChange={(e) => setSoumission(e.target.value)}
              placeholder="Rédigez votre réponse ici…"
              rows={8}
            />

            <Button
              variant="odc"
              className="w-full mt-4"
              onClick={() => mutation.mutate()}
              disabled={!soumission.trim() || mutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Soumettre l&apos;évaluation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
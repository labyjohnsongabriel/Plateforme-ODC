import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Send, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Textarea } from '@/components/common/Textarea';
import { Alert } from '@/components/common/Alert';
import { SessionSelector } from '@/features/formations';
import { useAuth } from '@/context/AuthContext';

import { InscriptionService } from '../services/inscription.service';

// ✅ VALEUR runtime (schéma Zod)
import { createInscriptionSchema } from '../types/inscription.types';

// ✅ TYPE pur → import type séparé
import type { CreateInscriptionFormData } from '../types/inscription.types';

// ============================================================================
//  PROPS
// ============================================================================

interface InscriptionFormProps {
  formationId?: string;
  sessionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function InscriptionForm({
  formationId,
  sessionId: initialSessionId,
  onSuccess,
  onCancel,
}: InscriptionFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(initialSessionId || '');
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInscriptionFormData>({
    resolver: zodResolver(createInscriptionSchema),
    defaultValues: {
      sessionId: initialSessionId || '',
      motivation: '',
    },
  });

  // ========================================================================
  //  SUBMIT
  // ========================================================================

  const onSubmit = async (data: CreateInscriptionFormData) => {
    if (!selectedSession) {
      setError('Veuillez sélectionner une session');
      return;
    }

    if (!user) {
      setError('Vous devez être connecté pour vous inscrire');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await InscriptionService.create({
        sessionId: selectedSession,
        motivation: data.motivation,
      });

      toast.success('Inscription envoyée avec succès !');
      onSuccess?.();
      navigate('/inscriptions');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de l'inscription";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  //  RENDER
  // ========================================================================

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-3xl mx-auto animate-fade-in"
    >
      {error && <Alert variant="error">{error}</Alert>}

      {/* ================================================================ */}
      {/* Info */}
      {/* ================================================================ */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark flex-shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg mb-1 text-odc-text-light dark:text-odc-text-dark">
              Inscription à une formation
            </h2>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Votre candidature sera examinée par le staff ODC. Vous recevrez
              une notification dès qu'une décision sera prise.
            </p>
          </div>
        </div>
      </Card>

      {/* ================================================================ */}
      {/* Sélection session */}
      {/* ================================================================ */}
      <Card>
        <h3 className="font-heading font-semibold text-lg mb-4 text-odc-text-light dark:text-odc-text-dark">
          Choisissez une session
        </h3>
        <SessionSelector
          formationId={formationId}
          value={selectedSession}
          onChange={setSelectedSession}
        />
      </Card>

      {/* ================================================================ */}
      {/* Motivation */}
      {/* ================================================================ */}
      <Card>
        <Textarea
          label="Motivation (optionnel)"
          placeholder="Pourquoi souhaitez-vous participer à cette formation ?"
          rows={4}
          maxLength={1000}
          showCount
          error={errors.motivation?.message}
          helper="Cette information aidera le staff à évaluer votre candidature"
          {...register('motivation')}
        />
      </Card>

      {/* ================================================================ */}
      {/* Actions */}
      {/* ================================================================ */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            icon={<X size={16} />}
            disabled={loading}
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!selectedSession}
          icon={<Send size={16} />}
        >
          Envoyer ma candidature
        </Button>
      </div>
    </form>
  );
}

export default InscriptionForm;
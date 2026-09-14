import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  Check,
  X,
  Save,
  KeyRound,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FormSection } from '@/components/forms/FormSection';
import { cn } from '@/utils/cn';

// ============================================================================
//  SCHÉMA
// ============================================================================

const changePasswordSchema = z
  .object({
    ancienMotDePasse: z.string().min(1, 'Requis'),
    nouveauMotDePasse: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Une majuscule requise')
      .regex(/[a-z]/, 'Une minuscule requise')
      .regex(/[0-9]/, 'Un chiffre requis'),
    confirmMotDePasse: z.string(),
  })
  .refine((data) => data.nouveauMotDePasse === data.confirmMotDePasse, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmMotDePasse'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ============================================================================
//  COMPOSANT
// ============================================================================

interface ChangePasswordProps {
  onSubmit: (ancien: string, nouveau: string) => Promise<boolean>;
  loading?: boolean;
  onCancel?: () => void;
}

export function ChangePassword({ onSubmit, loading, onCancel }: ChangePasswordProps) {
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      ancienMotDePasse: '',
      nouveauMotDePasse: '',
      confirmMotDePasse: '',
    },
  });

  const newPassword = watch('nouveauMotDePasse') || '';

  // Critères de force
  const strengthChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
  };

  const strength = Object.values(strengthChecks).filter(Boolean).length;
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
  const strengthColors = [
    'bg-odc-error',
    'bg-odc-error',
    'bg-odc-warning',
    'bg-odc-info',
    'bg-odc-success',
  ];

  const handleFormSubmit = async (data: ChangePasswordFormData) => {
    const ok = await onSubmit(data.ancienMotDePasse, data.nouveauMotDePasse);
    if (ok) reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <FormSection
          title="Changer le mot de passe"
          description="Pour votre sécurité, choisissez un mot de passe fort"
          icon={<KeyRound size={20} />}
          columns={1}
        >
          <Input
            label="Mot de passe actuel"
            type={showPasswords ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            error={errors.ancienMotDePasse?.message}
            required
            autoComplete="current-password"
            {...register('ancienMotDePasse')}
          />

          {/* Toggle show */}
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-2 text-xs text-odc-primary hover:underline"
          >
            {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />}
            {showPasswords ? 'Masquer' : 'Afficher'} les mots de passe
          </button>

          <div className="pt-2">
            <Input
              label="Nouveau mot de passe"
              type={showPasswords ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.nouveauMotDePasse?.message}
              required
              autoComplete="new-password"
              {...register('nouveauMotDePasse')}
            />

            {/* Strength indicator */}
            {newPassword && (
              <div className="mt-3">
                <div className="flex gap-1 mb-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors',
                        i < strength
                          ? strengthColors[strength]
                          : 'bg-odc-border-light dark:bg-odc-border-dark'
                      )}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  Force : <strong>{strengthLabels[strength]}</strong>
                </div>

                <div className="grid grid-cols-2 gap-1 mt-2 text-[10px]">
                  {Object.entries({
                    '8 caractères': strengthChecks.length,
                    '1 majuscule': strengthChecks.uppercase,
                    '1 minuscule': strengthChecks.lowercase,
                    '1 chiffre': strengthChecks.number,
                  }).map(([label, ok]) => (
                    <div
                      key={label}
                      className={cn(
                        'flex items-center gap-1',
                        ok
                          ? 'text-odc-success'
                          : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
                      )}
                    >
                      {ok ? <Check size={10} /> : <X size={10} />}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirmer le nouveau mot de passe"
            type={showPasswords ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            error={errors.confirmMotDePasse?.message}
            required
            autoComplete="new-password"
            {...register('confirmMotDePasse')}
          />
        </FormSection>

        {/* Info sécurité */}
        <div className="mt-6 p-3 rounded-lg bg-odc-warning-bg border border-odc-warning/30 flex items-start gap-3">
          <Shield size={16} className="text-odc-warning flex-shrink-0 mt-0.5" />
          <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
            <strong className="text-odc-warning">Conseils de sécurité :</strong>
            <ul className="mt-1 space-y-0.5">
              <li>• N'utilisez pas le même mot de passe sur d'autres sites</li>
              <li>• Évitez les mots courants ou les informations personnelles</li>
              <li>• Changez régulièrement votre mot de passe</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading} icon={<Save size={16} />}>
          Modifier le mot de passe
        </Button>
      </div>
    </form>
  );
}
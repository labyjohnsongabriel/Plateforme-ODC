import { useState } from 'react';
import {
  Bell,
  Mail,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  Check,
  Volume2,
  Shield,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { Select } from '@/components/common/Select';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/cn';

// ============================================================================
//  TYPES
// ============================================================================

interface Preferences {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyNewFormation: boolean;
  notifyNewMessage: boolean;
  notifyAttestation: boolean;

  // Affichage
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;

  // Accessibilité
  reduceMotion: boolean;
  highContrast: boolean;
}

const DEFAULT_PREFERENCES: Preferences = {
  emailNotifications: true,
  pushNotifications: true,
  notifyNewFormation: true,
  notifyNewMessage: true,
  notifyAttestation: true,
  theme: 'system',
  language: 'fr',
  dateFormat: 'dd/mm/yyyy',
  reduceMotion: false,
  highContrast: false,
};

// ============================================================================
//  COMPOSANT
// ============================================================================

interface PreferencesFormProps {
  onSave?: (preferences: Preferences) => Promise<void>;
}

export function PreferencesForm({ onSave }: PreferencesFormProps) {
  const { mode, setMode } = useTheme();
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const stored = localStorage.getItem('odc_preferences');
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });
  const [saving, setSaving] = useState(false);

  // ========================================================================
  // Update helper
  // ========================================================================
  const updatePreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));

    // Appliquer en temps réel
    if (key === 'theme') {
      const theme = value as Preferences['theme'];
      setMode(theme === 'system' ? 'light' : theme);
    }
  };

  // ========================================================================
  // Sauvegarder
  // ========================================================================
  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('odc_preferences', JSON.stringify(preferences));
      await onSave?.(preferences);
      toast.success('Préférences enregistrées');
    } catch {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  // ========================================================================
  // Reset
  // ========================================================================
  const handleReset = () => {
    if (!confirm('Réinitialiser toutes les préférences ?')) return;
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem('odc_preferences');
    toast.success('Préférences réinitialisées');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Notifications */}
      <Card>
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-odc-border-light dark:border-odc-border-dark">
          <div className="w-10 h-10 rounded-xl bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark dark:text-odc-primary-light">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark">
              Notifications
            </h3>
            <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Gérez comment vous souhaitez être notifié
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Checkbox
            label={
              <div>
                <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark">
                  Notifications par email
                </div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-0.5">
                  Recevoir un email pour les événements importants
                </div>
              </div>
            }
            checked={preferences.emailNotifications}
            onChange={(e) => updatePreference('emailNotifications', e.target.checked)}
          />

          <Checkbox
            label={
              <div>
                <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark">
                  Notifications push
                </div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-0.5">
                  Notifications en temps réel dans l'application
                </div>
              </div>
            }
            checked={preferences.pushNotifications}
            onChange={(e) => updatePreference('pushNotifications', e.target.checked)}
          />

          <div className="pl-6 pt-2 space-y-3 border-l-2 border-odc-primary-soft">
            <Checkbox
              label="Nouvelles formations disponibles"
              checked={preferences.notifyNewFormation}
              onChange={(e) => updatePreference('notifyNewFormation', e.target.checked)}
              disabled={!preferences.pushNotifications}
            />
            <Checkbox
              label="Nouveaux messages"
              checked={preferences.notifyNewMessage}
              onChange={(e) => updatePreference('notifyNewMessage', e.target.checked)}
              disabled={!preferences.pushNotifications}
            />
            <Checkbox
              label="Attestations disponibles"
              checked={preferences.notifyAttestation}
              onChange={(e) => updatePreference('notifyAttestation', e.target.checked)}
              disabled={!preferences.pushNotifications}
            />
          </div>
        </div>
      </Card>

      {/* Apparence */}
      <Card>
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-odc-border-light dark:border-odc-border-dark">
          <div className="w-10 h-10 rounded-xl bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark dark:text-odc-primary-light">
            <Eye size={20} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark">
              Apparence
            </h3>
            <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Personnalisez l'interface selon vos préférences
            </p>
          </div>
        </div>

        {/* Theme selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-odc-text-light dark:text-odc-text-dark">
            Thème
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: 'Clair', icon: Sun },
              { value: 'dark', label: 'Sombre', icon: Moon },
              { value: 'system', label: 'Système', icon: Monitor },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = preferences.theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreference('theme', option.value as any)}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    isSelected
                      ? 'border-odc-primary bg-odc-primary-soft dark:bg-odc-primary-soft/20'
                      : 'border-odc-border-light dark:border-odc-border-dark hover:border-odc-primary/50'
                  )}
                >
                  <Icon
                    size={22}
                    className={isSelected ? 'text-odc-primary' : 'text-odc-text-muted-light'}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isSelected
                        ? 'text-odc-primary-dark dark:text-odc-primary-light'
                        : 'text-odc-text-light dark:text-odc-text-dark'
                    )}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-odc-primary flex items-center justify-center">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language + Date format */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-odc-text-light dark:text-odc-text-dark">
              Langue
            </label>
            <Select
              value={preferences.language}
              onChange={(e) => updatePreference('language', e.target.value)}
              options={[
                { value: 'fr', label: 'Français' },
                { value: 'en', label: 'English' },
                { value: 'mg', label: 'Malagasy' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-odc-text-light dark:text-odc-text-dark">
              Format de date
            </label>
            <Select
              value={preferences.dateFormat}
              onChange={(e) => updatePreference('dateFormat', e.target.value)}
              options={[
                { value: 'dd/mm/yyyy', label: '31/12/2026' },
                { value: 'mm/dd/yyyy', label: '12/31/2026' },
                { value: 'yyyy-mm-dd', label: '2026-12-31' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Accessibilité */}
      <Card>
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-odc-border-light dark:border-odc-border-dark">
          <div className="w-10 h-10 rounded-xl bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark dark:text-odc-primary-light">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark">
              Accessibilité
            </h3>
            <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Adaptez l'interface à vos besoins
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Checkbox
            label={
              <div>
                <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark">
                  Réduire les animations
                </div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-0.5">
                  Désactiver les transitions et animations
                </div>
              </div>
            }
            checked={preferences.reduceMotion}
            onChange={(e) => updatePreference('reduceMotion', e.target.checked)}
          />

          <Checkbox
            label={
              <div>
                <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark">
                  Contraste élevé
                </div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-0.5">
                  Améliorer la lisibilité pour les malvoyants
                </div>
              </div>
            }
            checked={preferences.highContrast}
            onChange={(e) => updatePreference('highContrast', e.target.checked)}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 sticky bottom-4 bg-white dark:bg-odc-surface-dark p-4 rounded-xl border border-odc-border-light dark:border-odc-border-dark shadow-odc-md">
        <Button variant="ghost" onClick={handleReset}>
          Réinitialiser
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          icon={<Save size={16} />}
        >
          Enregistrer les préférences
        </Button>
      </div>
    </div>
  );
}
import { PreferencesForm } from '@/features/profile';

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
          Paramètres
        </h1>
        <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
          Personnalisez votre expérience sur la plateforme
        </p>
      </div>

      <PreferencesForm />
    </div>
  );
}
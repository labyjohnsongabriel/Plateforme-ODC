import type { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettings } from './components/GeneralSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { EmailSettings } from './components/EmailSettings';
import { BackupSettings } from './components/BackupSettings';

export const metadata: Metadata = { title: 'Paramètres' };

export default function ParametresPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Paramètres
        </h1>
        <p className="text-odc-muted mt-1">
          Configuration générale de la plateforme
        </p>
      </header>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="backup">Sauvegarde</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="email" className="mt-6">
          <EmailSettings />
        </TabsContent>
        <TabsContent value="backup" className="mt-6">
          <BackupSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
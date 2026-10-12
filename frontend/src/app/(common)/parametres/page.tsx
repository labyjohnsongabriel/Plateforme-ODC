import type { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettings } from './components/AccountSettings';
import { PasswordSettings } from './components/PasswordSettings';
import { NotificationSettings } from './components/NotificationSettings';

export const metadata: Metadata = { title: 'Paramètres' };

export default function ParametresPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Paramètres</h1>
        <p className="text-odc-muted mt-1">
          Gérez vos préférences de compte
        </p>
      </header>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="password">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-6">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="password" className="mt-6">
          <PasswordSettings />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
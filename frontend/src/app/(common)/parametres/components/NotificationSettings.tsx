'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Bell, Mail, MessageSquare, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const PREFERENCES = [
  {
    key: 'emailNotifications',
    icon: Mail,
    label: 'Notifications par email',
    description: 'Recevez un email pour chaque notification importante',
  },
  {
    key: 'messageNotifications',
    icon: MessageSquare,
    label: 'Nouveaux messages',
    description: 'Soyez alerté à chaque nouveau message reçu',
  },
  {
    key: 'attestationNotifications',
    icon: Award,
    label: 'Attestations disponibles',
    description: 'Notifiez-moi quand une attestation est prête',
  },
  {
    key: 'sessionNotifications',
    icon: Calendar,
    label: 'Rappels de session',
    description: 'Recevez un rappel 24h avant chaque session',
  },
];

export function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    messageNotifications: true,
    attestationNotifications: true,
    sessionNotifications: true,
  });

  const toggle = (key: string, value: boolean) => {
    setPrefs({ ...prefs, [key]: value });
    toast.success('Préférence mise à jour');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-odc-primary" />
          Préférences de notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4 divide-y divide-odc-border">
          {PREFERENCES.map((p, i) => {
            const Icon = p.icon;
            const value = prefs[p.key as keyof typeof prefs];
            return (
              <li
                key={p.key}
                className={`flex items-center justify-between gap-4 ${i > 0 ? 'pt-4' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-odc-primary" />
                  </div>
                  <div>
                    <Label htmlFor={p.key} className="font-medium cursor-pointer">
                      {p.label}
                    </Label>
                    <p className="text-xs text-odc-muted mt-0.5">
                      {p.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={p.key}
                  checked={value}
                  onCheckedChange={(v) => toggle(p.key, v)}
                />
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
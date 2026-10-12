'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, Mail, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EmailSettings() {
  const [form, setForm] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpFrom: 'Orange Digital Center <noreply@odc.mg>',
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Paramètres email enregistrés');
  };

  const handleTest = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setTesting(false);
    toast.success('Email de test envoyé avec succès');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-odc-primary" />
          Configuration SMTP
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="smtpHost">Hôte SMTP</Label>
            <Input
              id="smtpHost"
              value={form.smtpHost}
              onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="smtpPort">Port</Label>
            <Input
              id="smtpPort"
              type="number"
              value={form.smtpPort}
              onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) })}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="smtpUser">Utilisateur</Label>
          <Input
            id="smtpUser"
            value={form.smtpUser}
            onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="smtpFrom">Expéditeur par défaut</Label>
          <Input
            id="smtpFrom"
            value={form.smtpFrom}
            onChange={(e) => setForm({ ...form, smtpFrom: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div className="flex justify-between pt-4 border-t border-odc-border">
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            {testing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Tester l&apos;envoi
          </Button>

          <Button variant="odc" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
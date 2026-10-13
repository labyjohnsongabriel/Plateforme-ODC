'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2, Shield, Key, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function SecuritySettings() {
  const [form, setForm] = useState({
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: false,
    twoFactorRequired: false,
    sessionTimeoutMinutes: 60,
    maxLoginAttempts: 5,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Paramètres de sécurité enregistrés');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-odc-primary" />
          Sécurité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mot de passe */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Key className="h-4 w-4 text-odc-primary" />
            Politique de mot de passe
          </h3>
          <div className="space-y-3 pl-6">
            <div>
              <Label htmlFor="passwordMinLength">Longueur minimale</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={form.passwordMinLength}
                onChange={(e) =>
                  setForm({ ...form, passwordMinLength: Number(e.target.value) })
                }
                min={6}
                max={72}
                className="mt-1.5 w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Exiger une majuscule</Label>
              <Switch
                checked={form.requireUppercase}
                onCheckedChange={(v) => setForm({ ...form, requireUppercase: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Exiger un chiffre</Label>
              <Switch
                checked={form.requireNumber}
                onCheckedChange={(v) => setForm({ ...form, requireNumber: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Exiger un caractère spécial</Label>
              <Switch
                checked={form.requireSpecial}
                onCheckedChange={(v) => setForm({ ...form, requireSpecial: v })}
              />
            </div>
          </div>
        </div>

        {/* Session */}
        <div className="pt-6 border-t border-odc-border">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-odc-primary" />
            Sessions
          </h3>
          <div className="space-y-3 pl-6">
            <div>
              <Label htmlFor="sessionTimeout">Expiration de session (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={form.sessionTimeoutMinutes}
                onChange={(e) =>
                  setForm({ ...form, sessionTimeoutMinutes: Number(e.target.value) })
                }
                min={5}
                max={1440}
                className="mt-1.5 w-32"
              />
            </div>

            <div>
              <Label htmlFor="maxAttempts">Tentatives de connexion max</Label>
              <Input
                id="maxAttempts"
                type="number"
                value={form.maxLoginAttempts}
                onChange={(e) =>
                  setForm({ ...form, maxLoginAttempts: Number(e.target.value) })
                }
                min={3}
                max={20}
                className="mt-1.5 w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Authentification à deux facteurs obligatoire</Label>
                <p className="text-xs text-odc-muted mt-0.5">
                  Pour les administrateurs
                </p>
              </div>
              <Switch
                checked={form.twoFactorRequired}
                onCheckedChange={(v) => setForm({ ...form, twoFactorRequired: v })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-odc-border">
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
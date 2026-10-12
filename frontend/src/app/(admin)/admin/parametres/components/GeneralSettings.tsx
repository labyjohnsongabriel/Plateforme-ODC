'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export function GeneralSettings() {
  const [form, setForm] = useState({
    appName: 'ODC Platform',
    appDescription: 'Plateforme Orange Digital Center Madagascar',
    contactEmail: 'contact@odc.mg',
    contactPhone: '+261 00 000 00',
    maintenance: false,
    registrationOpen: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Paramètres enregistrés');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="appName">Nom de l&apos;application</Label>
          <Input
            id="appName"
            value={form.appName}
            onChange={(e) => setForm({ ...form, appName: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="appDescription">Description</Label>
          <Textarea
            id="appDescription"
            value={form.appDescription}
            onChange={(e) => setForm({ ...form, appDescription: e.target.value })}
            rows={3}
            className="mt-1.5"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactEmail">Email de contact</Label>
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">Téléphone</Label>
            <Input
              id="contactPhone"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-odc-border">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance">Mode maintenance</Label>
              <p className="text-xs text-odc-muted mt-0.5">
                Désactive temporairement l&apos;accès public
              </p>
            </div>
            <Switch
              id="maintenance"
              checked={form.maintenance}
              onCheckedChange={(v) => setForm({ ...form, maintenance: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="registrationOpen">Inscriptions ouvertes</Label>
              <p className="text-xs text-odc-muted mt-0.5">
                Autoriser les nouvelles inscriptions
              </p>
            </div>
            <Switch
              id="registrationOpen"
              checked={form.registrationOpen}
              onCheckedChange={(v) => setForm({ ...form, registrationOpen: v })}
            />
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
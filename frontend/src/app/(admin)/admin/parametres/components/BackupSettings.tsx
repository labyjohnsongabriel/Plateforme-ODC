'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Download, Upload, Database, Loader2, Clock, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function BackupSettings() {
  const [exporting, setExporting] = useState(false);
  const [lastBackup] = useState('2025-01-20 14:32');

  const handleExport = async () => {
    setExporting(true);
    toast.info('Génération du backup en cours…');
    await new Promise((r) => setTimeout(r, 2000));
    setExporting(false);
    toast.success('Backup généré');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-odc-primary" />
            Sauvegarde de la base de données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-odc-surface-alt">
            <Clock className="h-4 w-4 text-odc-muted" />
            <p className="text-sm">
              Dernière sauvegarde : <strong>{lastBackup}</strong>
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Button variant="odc" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exporter la base
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Restaurer un backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-odc-warning">
            <AlertTriangle className="h-5 w-5" />
            Zone dangereuse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-odc-muted mb-4">
            Ces actions sont irréversibles. À utiliser en cas d&apos;urgence
            uniquement.
          </p>
          <Button
            variant="outline"
            className="text-odc-error border-odc-error hover:bg-odc-error-bg hover:text-odc-error"
            onClick={() => {
              if (confirm('Voulez-vous vraiment vider le cache ?')) {
                toast.success('Cache vidé');
              }
            }}
          >
            Vider le cache système
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
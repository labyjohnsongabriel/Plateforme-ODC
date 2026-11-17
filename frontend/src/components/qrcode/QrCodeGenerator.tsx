// src/components/qr/QrCodeGenerator.tsx
'use client';

import { useState } from 'react';
import { QrCode, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QrCodeDisplay, type ErrorCorrectionLevel } from './QrCodeDisplay';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface QrCodeGeneratorProps {
  initialValue?: string;
  onGenerate?: (value: string) => void;
  presets?: Array<{ label: string; value: string }>;
  className?: string;
}

/* ============================================================================
   OPTIONS
   ============================================================================ */

const SIZE_OPTIONS = [
  { value: '200', label: 'Petit (200px)' },
  { value: '300', label: 'Moyen (300px)' },
  { value: '400', label: 'Grand (400px)' },
  { value: '500', label: 'Très grand (500px)' },
];

const COLOR_OPTIONS = [
  { value: '#FF7900', label: 'Orange ODC' },
  { value: '#E65100', label: 'Orange foncé' },
  { value: '#000000', label: 'Noir' },
  { value: '#0277BD', label: 'Bleu' },
  { value: '#2E7D32', label: 'Vert' },
];

const ERROR_OPTIONS: Array<{ value: ErrorCorrectionLevel; label: string }> = [
  { value: 'L', label: 'Faible (7%)' },
  { value: 'M', label: 'Moyen (15%)' },
  { value: 'Q', label: 'Élevé (25%)' },
  { value: 'H', label: 'Maximum (30%)' },
];

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function QrCodeGenerator({
  initialValue = '',
  onGenerate,
  presets = [],
  className,
}: QrCodeGeneratorProps) {
  const [value, setValue] = useState(initialValue);
  const [size, setSize] = useState('300');
  const [color, setColor] = useState('#FF7900');
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('H');
  const [generated, setGenerated] = useState(initialValue);

  const handleGenerate = () => {
    if (!value.trim()) {
      toast.error('Veuillez saisir une valeur');
      return;
    }
    setGenerated(value);
    onGenerate?.(value);
    toast.success('QR Code généré');
  };

  const handlePresetClick = (presetValue: string) => {
    setValue(presetValue);
    setGenerated(presetValue);
  };

  return (
    <div className={cn('grid grid-cols-1 gap-6 lg:grid-cols-2', className)}>
      {/* ================================================================
          FORMULAIRE
          ================================================================ */}
      <Card variant="elevated" padding="lg">
        <div className="mb-6 flex items-start gap-3">
          <div className="bg-odc-primary/10 text-odc-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-odc-primary/20">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight">
              Générateur QR Code
            </h3>
            <p className="text-odc-muted mt-0.5 text-sm">
              Créez des QR codes personnalisés
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Valeur */}
          <div>
            <Label htmlFor="qr-value">
              Contenu du QR Code <span className="text-odc-error">*</span>
            </Label>
            <Input
              id="qr-value"
              placeholder="https://odc.mg ou texte..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
              className="mt-1.5 font-mono text-sm"
            />
          </div>

          {/* Presets */}
          {presets.length > 0 && (
            <div>
              <Label className="text-xs">Raccourcis</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePresetClick(p.value)}
                    className="bg-odc-surface-alt hover:bg-odc-primary/10 hover:text-odc-primary rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Taille */}
          <div>
            <Label htmlFor="qr-size">Taille</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger id="qr-size" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Couleur */}
          <div>
            <Label htmlFor="qr-color">Couleur</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger id="qr-color" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: o.value }}
                      />
                      {o.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Correction d'erreur */}
          <div>
            <Label htmlFor="qr-error">Niveau de correction d&apos;erreur</Label>
            <Select
              value={errorCorrection}
              onValueChange={(v) => setErrorCorrection(v as ErrorCorrectionLevel)}
            >
              <SelectTrigger id="qr-error" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ERROR_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-odc-muted mt-1 text-xs">
              Plus le niveau est élevé, plus le QR code résiste aux dommages
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="brand"
              fullWidth
              onClick={handleGenerate}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Générer
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setValue('');
                setGenerated('');
              }}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Effacer
            </Button>
          </div>
        </div>
      </Card>

      {/* ================================================================
          APERÇU
          ================================================================ */}
      <QrCodeDisplay
        value={generated || 'placeholder'}
        size={Number(size)}
        color={color}
        errorCorrectionLevel={errorCorrection}
        title={generated ? 'Aperçu' : 'Entrez une valeur'}
        description={
          generated ? 'Scannez pour tester' : 'Le QR code apparaîtra ici'
        }
      />
    </div>
  );
}
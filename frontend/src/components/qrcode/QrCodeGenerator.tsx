import { useState } from 'react';
import { QrCode, Download, Copy, RefreshCw, Check } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { QrCodeDisplay } from './QrCodeDisplay';
import { toast } from '@/components/common/Toast';

export interface QrCodeGeneratorProps {
  initialValue?: string;
  onGenerate?: (value: string) => void;
  presets?: Array<{ label: string; value: string }>;
  className?: string;
}

export function QrCodeGenerator({
  initialValue = '',
  onGenerate,
  presets = [],
  className,
}: QrCodeGeneratorProps) {
  const [value, setValue] = useState(initialValue);
  const [size, setSize] = useState('300');
  const [color, setColor] = useState('#FF7900');
  const [errorCorrection, setErrorCorrection] = useState('H');
  const [generated, setGenerated] = useState(initialValue);

  const sizeOptions = [
    { value: '200', label: 'Petit (200px)' },
    { value: '300', label: 'Moyen (300px)' },
    { value: '400', label: 'Grand (400px)' },
    { value: '500', label: 'Très grand (500px)' },
  ];

  const colorOptions = [
    { value: '#FF7900', label: 'Orange ODC' },
    { value: '#E65100', label: 'Orange foncé' },
    { value: '#000000', label: 'Noir' },
    { value: '#0277BD', label: 'Bleu' },
    { value: '#2E7D32', label: 'Vert' },
  ];

  const errorOptions = [
    { value: 'L', label: 'Faible (7%)' },
    { value: 'M', label: 'Moyen (15%)' },
    { value: 'Q', label: 'Élevé (25%)' },
    { value: 'H', label: 'Maximum (30%)' },
  ];

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
    <div className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark dark:text-odc-primary-light">
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-odc-text-light dark:text-odc-text-dark">
                Générateur QR Code
              </h3>
              <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Créez des QR codes personnalisés
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Valeur */}
            <Input
              label="Contenu du QR Code"
              placeholder="https://odc.mg ou texte..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />

            {/* Presets */}
            {presets.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-odc-text-light dark:text-odc-text-dark">
                  Raccourcis
                </label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handlePresetClick(p.value)}
                      className="px-3 py-1.5 rounded-full bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-sm text-odc-text-light dark:text-odc-text-dark hover:bg-odc-primary-soft transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Taille */}
            <Select
              label="Taille"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              options={sizeOptions}
            />

            {/* Couleur */}
            <Select
              label="Couleur"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              options={colorOptions}
            />

            {/* Correction d'erreur */}
            <Select
              label="Niveau de correction d'erreur"
              value={errorCorrection}
              onChange={(e) => setErrorCorrection(e.target.value)}
              options={errorOptions}
              helper="Plus le niveau est élevé, plus le QR code est résistant aux dommages"
            />

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                fullWidth
                icon={<QrCode size={16} />}
                onClick={handleGenerate}
              >
                Générer
              </Button>
              <Button
                variant="secondary"
                icon={<RefreshCw size={16} />}
                onClick={() => {
                  setValue('');
                  setGenerated('');
                }}
              >
                Effacer
              </Button>
            </div>
          </div>
        </Card>

        {/* Aperçu */}
        <QrCodeDisplay
          value={generated || 'placeholder'}
          size={Number(size)}
          color={color}
          title={generated ? 'Aperçu' : 'Entrez une valeur'}
          description={
            generated
              ? 'Scannez pour tester'
              : 'Le QR code apparaîtra ici'
          }
        />
      </div>
    </div>
  );
}
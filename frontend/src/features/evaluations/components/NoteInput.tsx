import { useState } from 'react';
import { Save, X, User, Award, MessageSquare } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Avatar } from '@/components/common/Avatar';
import { ProgressBar } from '@/components/common/ProgressBar';
import { cn } from '@/utils/cn';

interface NoteInputProps {
  participant: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    photoUrl?: string;
  };
  noteMax: number;
  initialNote?: number;
  initialCommentaire?: string;
  onSave: (note: number, commentaire?: string) => Promise<void>;
  onCancel?: () => void;
}

export function NoteInput({
  participant,
  noteMax,
  initialNote,
  initialCommentaire,
  onSave,
  onCancel,
}: NoteInputProps) {
  const [note, setNote] = useState<number>(initialNote || 0);
  const [commentaire, setCommentaire] = useState(initialCommentaire || '');
  const [loading, setLoading] = useState(false);

  const percentage = (note / noteMax) * 100;
  const variant = percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'error';

  const handleSave = async () => {
    if (note < 0 || note > noteMax) return;
    setLoading(true);
    try {
      await onSave(note, commentaire || undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      {/* Participant */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-odc-border-light dark:border-odc-border-dark">
        <Avatar
          src={participant.photoUrl}
          name={`${participant.prenom} ${participant.nom}`}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark truncate">
            {participant.prenom} {participant.nom}
          </div>
          <div className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
            {participant.email}
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-odc-text-light dark:text-odc-text-dark">
          Note <span className="text-odc-error">*</span>
        </label>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={noteMax}
            step={0.5}
            value={note}
            onChange={(e) => setNote(Number(e.target.value))}
            className="flex-1 h-2 rounded-full appearance-none bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark accent-odc-primary"
          />

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={noteMax}
              step={0.5}
              value={note}
              onChange={(e) => setNote(Number(e.target.value))}
              className={cn(
                'w-20 px-3 py-2 rounded-lg text-center font-bold text-lg',
                'bg-white dark:bg-odc-surface-dark',
                'border-2 transition-colors',
                'focus:outline-none focus:ring-4 focus:ring-odc-primary/10',
                variant === 'success'
                  ? 'border-odc-success text-odc-success'
                  : variant === 'warning'
                  ? 'border-odc-warning text-odc-warning'
                  : 'border-odc-error text-odc-error'
              )}
            />
            <span className="text-odc-text-muted-light dark:text-odc-text-muted-dark font-medium">
              / {noteMax}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar value={percentage} variant={variant} showLabel />
        </div>
      </div>

      {/* Commentaire */}
      <div className="mb-6">
        <Textarea
          label="Commentaire (optionnel)"
          placeholder="Ajoutez un commentaire sur la performance..."
          rows={3}
          maxLength={500}
          showCount
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} icon={<X size={16} />}>
            Annuler
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSave}
          loading={loading}
          icon={<Save size={16} />}
        >
          Enregistrer la note
        </Button>
      </div>
    </Card>
  );
}
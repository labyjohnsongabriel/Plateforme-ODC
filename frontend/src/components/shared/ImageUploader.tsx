// src/components/shared/ImageUploader.tsx
'use client';

import * as React from 'react';
import { Camera, Loader2, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getErrorMessage } from '@/lib/error-handler';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  /** Fonction d'upload (retourne l'URL finale) */
  onUpload: (file: File) => Promise<string>;
  onDelete?: (url: string) => Promise<void>;
  label?: string;
  helperText?: string;
  aspect?: 'square' | 'video' | 'portrait' | 'auto';
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

const ASPECTS = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  auto: '',
};

export function ImageUploader({
  value,
  onChange,
  onUpload,
  onDelete,
  label,
  helperText,
  aspect = 'square',
  maxSizeMB = 5,
  className,
  disabled,
}: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  /* ---------------- Validation ---------------- */
  const validate = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return false;
    }
    const max = maxSizeMB * 1024 * 1024;
    if (file.size > max) {
      toast.error(`Taille max : ${maxSizeMB} Mo`);
      return false;
    }
    return true;
  };

  /* ---------------- Upload ---------------- */
  const handleFile = async (file: File) => {
    if (!validate(file)) return;
    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
      toast.success('Image téléversée');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  /* ---------------- Drag & Drop ---------------- */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = async () => {
    if (!value || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(value);
      onChange(null);
      toast.success('Image supprimée');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  const busy = uploading || deleting;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <p className="text-sm font-medium text-odc-text-primary">{label}</p>
      )}

      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors overflow-hidden',
          dragActive
            ? 'border-odc-primary bg-odc-primary-soft/40'
            : 'border-odc-border bg-odc-surface-alt',
          ASPECTS[aspect],
          disabled && 'opacity-60 cursor-not-allowed',
          !disabled && !value && 'cursor-pointer hover:border-odc-primary hover:bg-odc-primary-soft/30',
        )}
        onDrop={disabled ? undefined : handleDrop}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onClick={!disabled && !value ? () => inputRef.current?.click() : undefined}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  disabled={busy}
                >
                  <Camera className="h-4 w-4 mr-1.5" />
                  Changer
                </Button>
                {onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={busy}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-odc-primary mb-2" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-odc-primary-soft flex items-center justify-center mb-2">
                <Upload className="h-6 w-6 text-odc-primary" />
              </div>
            )}
            <p className="text-sm font-medium">
              {uploading ? 'Téléversement…' : 'Cliquez ou glissez une image'}
            </p>
            <p className="text-xs text-odc-muted mt-1">
              PNG, JPG, WEBP — Max {maxSizeMB} Mo
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleInputChange}
          disabled={disabled || busy}
        />
      </div>

      {helperText && (
        <p className="text-xs text-odc-muted">{helperText}</p>
      )}
    </div>
  );
}
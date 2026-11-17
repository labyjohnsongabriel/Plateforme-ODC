// src/app/(staff)/staff/ressources/components/RessourceUpload.tsx
'use client';

import { useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Upload, Loader2, FolderOpen, X, FileText, Image as ImageIcon,
  Video, Link2, FileSpreadsheet, Presentation, Check,
  AlertCircle, RefreshCw,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatBytes } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth'; // ⭐ Rôle de l'utilisateur

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES & CONSTANTES
   ═══════════════════════════════════════════════════════════════════════════ */

type ResourceType = 'PDF' | 'VIDEO' | 'IMAGE' | 'LIEN' | 'DOCUMENT' | 'PRESENTATION';

interface ResourceTypeConfig {
  value: ResourceType;
  label: string;
  icon: React.ElementType;
  accepts: string;
  mime: string[];
  needsUrl: boolean;
  color: string;
}

const RESOURCE_TYPES: ResourceTypeConfig[] = [
  {
    value: 'PDF',
    label: 'PDF',
    icon: FileText,
    accepts: '.pdf',
    mime: ['application/pdf'],
    needsUrl: false,
    color: 'text-odc-error',
  },
  {
    value: 'VIDEO',
    label: 'Vidéo',
    icon: Video,
    accepts: 'video/*',
    mime: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    needsUrl: false,
    color: 'text-odc-info',
  },
  {
    value: 'IMAGE',
    label: 'Image',
    icon: ImageIcon,
    accepts: 'image/*',
    mime: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    needsUrl: false,
    color: 'text-odc-purple',
  },
  {
    value: 'DOCUMENT',
    label: 'Document',
    icon: FileSpreadsheet,
    accepts: '.doc,.docx,.txt,.odt,.rtf',
    mime: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
    ],
    needsUrl: false,
    color: 'text-odc-success',
  },
  {
    value: 'PRESENTATION',
    label: 'Présentation',
    icon: Presentation,
    accepts: '.ppt,.pptx,.key,.odp',
    mime: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    needsUrl: false,
    color: 'text-odc-warning',
  },
  {
    value: 'LIEN',
    label: 'Lien externe',
    icon: Link2,
    accepts: '',
    mime: [],
    needsUrl: true,
    color: 'text-odc-primary',
  },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 Mo

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function validateFile(file: File, type: ResourceTypeConfig): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `Le fichier dépasse la taille maximale de ${formatBytes(MAX_FILE_SIZE)}.`;
  }
  if (type.mime.length > 0 && file.type && !type.mime.includes(file.type)) {
    return `Format non supporté pour « ${type.label} ». Formats acceptés : ${type.mime
      .map((m) => m.split('/')[1])
      .join(', ')}.`;
  }
  return null;
}

function extractSessions(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    for (const key of ['sessions', 'data', 'items', 'results']) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

interface FormState {
  sessionId: string;
  titre: string;
  description: string;
  type: ResourceType;
  url: string;
}

const INITIAL_FORM: FormState = {
  sessionId: '',
  titre: '',
  description: '',
  type: 'PDF',
  url: '',
};

export function RessourceUploadDialog() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  /* ⭐ Détection du rôle pour utiliser la bonne API */
  const { user } = useAuth();
  const role = user?.role?.nom;
  const isFormateur = role === 'FORMATEUR';
  const isStaffOrAdmin = role === 'STAFF_ODC' || role === 'ADMINISTRATEUR';

  const sessionsEndpoint = isFormateur
    ? '/formateur/sessions'
    : '/staff/sessions';

  const ressourcesEndpoint = isFormateur
    ? '/formateur/ressources'
    : '/staff/ressources';

  const typeConfig =
    RESOURCE_TYPES.find((t) => t.value === form.type) ?? RESOURCE_TYPES[0];
  const TypeIcon = typeConfig.icon;
  const isUrlType = typeConfig.needsUrl;

  /* ═══════════════════════════════════════════════════════════════════════
     SESSIONS
     ═══════════════════════════════════════════════════════════════════════ */

  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
    isFetching: sessionsFetching,
  } = useQuery({
    queryKey: [role, 'sessions', 'for-upload'],
    queryFn: async () => {
      const response = await api.get(sessionsEndpoint, {
        params: { limit: 200 },
      });
      return extractSessions(response.data?.data ?? response.data);
    },
    enabled: open && !!role,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  /* ═══════════════════════════════════════════════════════════════════════
     MUTATION
     ═══════════════════════════════════════════════════════════════════════ */

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.sessionId) throw new Error('Session requise');
      if (!form.titre.trim()) throw new Error('Titre requis');

      if (isUrlType) {
        if (!form.url.trim()) throw new Error('URL requise');
        try {
          new URL(form.url);
        } catch {
          throw new Error('URL invalide');
        }

        await api.post(ressourcesEndpoint, {
          sessionId: form.sessionId,
          titre: form.titre.trim(),
          description: form.description.trim() || null,
          type: form.type,
          url: form.url.trim(),
        });
      } else {
        if (!file) throw new Error('Fichier requis');

        const fd = new FormData();
        fd.append('fichier', file);
        fd.append('sessionId', form.sessionId);
        fd.append('titre', form.titre.trim());
        fd.append('description', form.description.trim() || '');
        fd.append('type', form.type);

        await api.post(ressourcesEndpoint, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      toast.success('Ressource uploadée avec succès');
      qc.invalidateQueries({ queryKey: ['staff', 'ressources'] });
      qc.invalidateQueries({ queryKey: ['formateur', 'ressources'] });
      handleClose();
    },
    onError: (e) => {
      console.error('[RessourceUpload] Erreur:', e);
      toast.error(getErrorMessage(e));
    },
  });

  /* ═══════════════════════════════════════════════════════════════════════
     HANDLERS
     ═══════════════════════════════════════════════════════════════════════ */

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setForm(INITIAL_FORM);
    setDragOver(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = (selectedFile: File | null) => {
    if (!selectedFile) return;
    const err = validateFile(selectedFile, typeConfig);
    if (err) {
      toast.error(err);
      if (fileRef.current) fileRef.current.value = '';
      setFile(null);
      return;
    }
    setFile(selectedFile);

    // Auto-remplir le titre si vide
    if (!form.titre.trim()) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^.]+$/, '');
      setForm((f) => ({ ...f, titre: nameWithoutExt }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleTypeChange = (value: ResourceType) => {
    setForm((f) => ({ ...f, type: value, url: '' }));
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const isFormValid =
    !!form.sessionId &&
    !!form.titre.trim() &&
    (isUrlType ? !!form.url.trim() : !!file) &&
    !mutation.isPending &&
    (isFormateur || isStaffOrAdmin);

  /* ═══════════════════════════════════════════════════════════════════════
     RENDU
     ═══════════════════════════════════════════════════════════════════════ */

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => (o ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>
        <Button variant="odc">
          <Upload className="mr-2 h-4 w-4" aria-hidden />
          Uploader
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-odc-primary" aria-hidden />
            Nouvelle ressource
          </DialogTitle>
          <DialogDescription>
            Uploadez un support pédagogique pour vos participants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ═══════ SESSION ═══════ */}
          <div>
            <Label htmlFor="session">
              Session <span className="text-odc-error">*</span>
            </Label>

            {sessionsLoading ? (
              <Skeleton className="mt-1.5 h-10 w-full rounded-md" />
            ) : sessionsError ? (
              <div className="mt-1.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs">
                <p className="mb-2 text-destructive">
                  Impossible de charger les sessions.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchSessions()}
                  disabled={sessionsFetching}
                >
                  {sessionsFetching ? (
                    <Loader2
                      className="mr-1.5 h-3 w-3 animate-spin"
                      aria-hidden
                    />
                  ) : (
                    <RefreshCw className="mr-1.5 h-3 w-3" aria-hidden />
                  )}
                  Réessayer
                </Button>
              </div>
            ) : (
              <Select
                value={form.sessionId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, sessionId: v }))
                }
                disabled={mutation.isPending}
              >
                <SelectTrigger id="session" className="mt-1.5">
                  <SelectValue placeholder="Sélectionnez une session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.length === 0 ? (
                    <div className="p-2 text-xs text-odc-text-muted">
                      Aucune session disponible.
                    </div>
                  ) : (
                    sessions.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="font-mono text-xs text-odc-text-muted">
                          {s.codeSession ?? s.code_session ?? s.id.slice(0, 8)}
                        </span>
                        <span className="mx-2 text-odc-text-muted">—</span>
                        <span>{s.formation?.titre ?? 'Sans titre'}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* ═══════ TITRE + TYPE ═══════ */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="titre">
                Titre <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="titre"
                value={form.titre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, titre: e.target.value }))
                }
                className="mt-1.5"
                placeholder="Ex : Support de cours — Module 1"
                disabled={mutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="type">
                Type <span className="text-odc-error">*</span>
              </Label>
              <Select
                value={form.type}
                onValueChange={(v) => handleTypeChange(v as ResourceType)}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="type" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <Icon
                          className={cn('mr-2 inline h-4 w-4', t.color)}
                          aria-hidden
                        />
                        {t.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ═══════ DESCRIPTION ═══════ */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              className="mt-1.5 resize-none"
              placeholder="Décrivez brièvement cette ressource…"
              disabled={mutation.isPending}
            />
          </div>

          {/* ═══════ FICHIER OU URL ═══════ */}
          {isUrlType ? (
            <div>
              <Label htmlFor="url">
                URL <span className="text-odc-error">*</span>
              </Label>
              <div className="relative mt-1.5">
                <Link2
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-odc-text-muted"
                  aria-hidden
                />
                <Input
                  id="url"
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, url: e.target.value }))
                  }
                  className="pl-10"
                  placeholder="https://exemple.com/ressource"
                  disabled={mutation.isPending}
                />
              </div>
              <p className="mt-1.5 text-xs text-odc-text-muted">
                Le lien sera ouvert dans un nouvel onglet.
              </p>
            </div>
          ) : (
            <div>
              <Label>
                Fichier <span className="text-odc-error">*</span>
              </Label>

              <input
                ref={fileRef}
                type="file"
                hidden
                accept={typeConfig.accepts}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />

              {file ? (
                <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-odc-border bg-odc-surface-alt p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-odc-primary-soft">
                    <TypeIcon
                      className="h-6 w-6 text-odc-primary"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-odc-text-primary">
                      {file.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-odc-text-muted">
                      <Badge variant="outline" className="text-[10px]">
                        {typeConfig.label}
                      </Badge>
                      <span>{formatBytes(file.size)}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFile(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    disabled={mutation.isPending}
                    aria-label="Retirer le fichier"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileRef.current?.click();
                    }
                  }}
                  className={cn(
                    'mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-2',
                    dragOver
                      ? 'border-odc-primary bg-odc-primary-soft/50'
                      : 'border-odc-border hover:border-odc-primary/50 hover:bg-odc-surface-alt/50',
                    mutation.isPending && 'pointer-events-none opacity-50',
                  )}
                  aria-label={`Sélectionner un fichier ${typeConfig.label}`}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                      dragOver
                        ? 'bg-odc-primary text-white'
                        : 'bg-odc-surface-alt text-odc-text-muted',
                    )}
                  >
                    {dragOver ? (
                      <Check className="h-6 w-6" aria-hidden />
                    ) : (
                      <FolderOpen className="h-6 w-6" aria-hidden />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-odc-text-primary">
                      {dragOver
                        ? 'Relâchez pour uploader'
                        : 'Glissez-déposez ou cliquez'}
                    </p>
                    <p className="mt-0.5 text-xs text-odc-text-muted">
                      {typeConfig.label} • max {formatBytes(MAX_FILE_SIZE)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════ ERREUR RÔLE ═══════ */}
          {!isFormateur && !isStaffOrAdmin && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                Votre rôle ne permet pas d'uploader des ressources. Contactez un
                administrateur.
              </span>
            </div>
          )}
        </div>

        {/* ═══════ FOOTER ═══════ */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="odc"
            onClick={() => mutation.mutate()}
            disabled={!isFormValid}
          >
            {mutation.isPending ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden
                />
                Upload…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" aria-hidden />
                Uploader
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { cn } from '@/utils/cn';

interface AvatarUploadProps {
  currentAvatar?: string;
  name: string;
  onUpload: (file: File) => Promise<string | null>;
  size?: 'md' | 'lg' | 'xl' | '2xl';
}

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export function AvatarUpload({
  currentAvatar,
  name,
  onUpload,
  size = '2xl',
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // ========================================================================
  // Sélectionner fichier
  // ========================================================================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider
    if (!ACCEPTED.includes(file.type)) {
      toast.error('Format non supporté (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error('Fichier trop volumineux (max 2 MB)');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setModalOpen(true);
  };

  // ========================================================================
  // Uploader
  // ========================================================================
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await onUpload(selectedFile);
      handleClose();
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    setModalOpen(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      {/* Avatar + overlay */}
      <div className="group relative inline-block">
        <Avatar src={currentAvatar} name={name} size={size} />

        {/* Overlay */}
        <button
          onClick={() => inputRef.current?.click()}
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-black/60 backdrop-blur-sm',
            'flex flex-col items-center justify-center',
            'opacity-0 group-hover:opacity-100',
            'cursor-pointer transition-opacity',
          )}
        >
          <Camera size={24} className="mb-1 text-white" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
            Changer
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Modal preview */}
      <Modal
        isOpen={modalOpen}
        onClose={handleClose}
        title="Changer l'avatar"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={handleClose} disabled={uploading}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={uploading}
              icon={<Upload size={16} />}
            >
              Enregistrer
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center py-4">
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Aperçu"
                className="h-40 w-40 rounded-full object-cover shadow-odc-lg ring-4 ring-odc-primary"
              />
              <button
                onClick={handleClose}
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-odc-error text-white transition-colors hover:bg-red-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {selectedFile && (
            <div className="mt-4 text-center">
              <div className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark">
                {selectedFile.name}
              </div>
              <div className="mt-1 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          )}

          <div className="mt-6 w-full rounded-lg border border-odc-info/20 bg-odc-info-bg p-3">
            <p className="text-center text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Formats acceptés : JPEG, PNG, WEBP • Max 2 MB
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

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
      <div className="relative group inline-block">
        <Avatar src={currentAvatar} name={name} size={size} />

        {/* Overlay */}
        <button
          onClick={() => inputRef.current?.click()}
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-black/60 backdrop-blur-sm',
            'flex flex-col items-center justify-center',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity cursor-pointer'
          )}
        >
          <Camera size={24} className="text-white mb-1" />
          <span className="text-white text-[10px] font-semibold uppercase tracking-wider">
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
                className="w-40 h-40 rounded-full object-cover ring-4 ring-odc-primary shadow-odc-lg"
              />
              <button
                onClick={handleClose}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-odc-error text-white flex items-center justify-center hover:bg-red-700 transition-colors"
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
              <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          )}

          <div className="mt-6 p-3 rounded-lg bg-odc-info-bg border border-odc-info/20 w-full">
            <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark text-center">
              Formats acceptés : JPEG, PNG, WEBP • Max 2 MB
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
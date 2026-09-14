import { useRef, useState } from 'react';
import { Upload, X, File, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // MB
  multiple?: boolean;
  onFilesChange: (files: File[]) => void;
  value?: File[];
  error?: string;
  preview?: boolean;
}

export function FileUpload({
  label,
  accept = 'image/*',
  maxSize = 5,
  multiple = false,
  onFilesChange,
  value = [],
  error,
  preview = true,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).filter((f) => f.size <= maxSize * 1024 * 1024);
    onFilesChange(multiple ? [...value, ...fileArray] : fileArray.slice(0, 1));
  };

  const removeFile = (index: number) => {
    onFilesChange(value.filter((_, i) => i !== index));
  };

  const isImage = (file: File) => file.type.startsWith('image/');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-odc-text-light dark:text-odc-text-dark">
          {label}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
          dragActive
            ? 'border-odc-primary bg-odc-primary-soft dark:bg-odc-primary-soft/10'
            : 'border-odc-border-light dark:border-odc-border-dark hover:border-odc-primary hover:bg-odc-primary-soft/30 dark:hover:bg-odc-primary-soft/5',
          error && 'border-odc-error'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload size={32} className="mx-auto text-odc-primary mb-2" />
        <p className="text-sm text-odc-text-light dark:text-odc-text-dark">
          <span className="font-semibold text-odc-primary">Cliquez pour uploader</span>
          {' ou glissez-déposez'}
        </p>
        <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1">
          Max {maxSize} MB
        </p>
      </div>

      {/* Fichiers */}
      {value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded-lg"
            >
              {preview && isImage(file) ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-odc-primary-soft flex items-center justify-center">
                  <File size={18} className="text-odc-primary-dark" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-odc-text-light dark:text-odc-text-dark">
                  {file.name}
                </p>
                <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="p-1.5 rounded hover:bg-odc-error-bg text-odc-error transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-odc-error">{error}</p>}
    </div>
  );
}
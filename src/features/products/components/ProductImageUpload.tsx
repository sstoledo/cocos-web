import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { useId, useState } from 'react';

export type ProductImageUploadProps = {
  imageUrl?: string;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ProductImageUpload({
  imageUrl,
  onChange,
  onRemove,
}: ProductImageUploadProps) {
  const inputId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError(null);

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('El archivo debe ser una imagen (JPEG, PNG, WebP o GIF).');
      onChange(null);
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen no puede superar los 2 MB.');
      onChange(null);
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    onChange(file);
  }

  function handleClearSelection() {
    if (selectedFile) {
      URL.revokeObjectURL(previewUrl ?? '');
    }

    setSelectedFile(null);
    setPreviewUrl(imageUrl ?? null);
    setError(null);
    onChange(null);

    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
  }

  function handleRemoveImage() {
    onRemove?.();
  }

  const hasImage = Boolean(previewUrl);
  const hasExistingImage = Boolean(imageUrl) && !selectedFile;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>Imagen del producto</Label>
      <div className="flex items-center gap-4">
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-describedby={`${inputId}-error`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {hasImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </Button>
        {selectedFile && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
          >
            Quitar
          </Button>
        )}
        {hasExistingImage && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
          >
            Eliminar imagen
          </Button>
        )}
      </div>
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Vista previa"
          className="h-32 w-32 rounded-md border border-border object-cover"
        />
      )}
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { useId, useState } from 'react';

export type ProductImageUploadProps = {
  imageUrl?: string;
  onChange: (file: File | null) => void;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ProductImageUpload({
  imageUrl,
  onChange,
}: ProductImageUploadProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError(null);

    if (!file) {
      onChange(null);
      setPreviewUrl(imageUrl ?? null);
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

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onChange(file);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }

  function handleRemove() {
    onChange(null);
    setPreviewUrl(imageUrl ?? null);
    setError(null);
  }

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
          Seleccionar imagen
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
          >
            Quitar
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

import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { useId, useState } from 'react';
import {
  RECEIPT_FILE_ACCEPT,
  validateReceiptFile,
} from '../api/create-receipt';
import { useCreateReceipt } from '../hooks/use-receipt-mutations';
import { getReceiptErrorMessage } from '../lib/receipt-errors';
import type { Receipt } from '../types';

type ReceiptUploadProps = {
  onUploaded: (receipt: Receipt) => void;
};

export function ReceiptUpload({ onUploaded }: ReceiptUploadProps) {
  const inputId = useId();
  const mutation = useCreateReceipt();
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function selectFile(nextFile: File | null) {
    mutation.reset();
    if (!nextFile) {
      setFile(null);
      setValidationError(null);
      return;
    }
    const error = validateReceiptFile(nextFile);
    setFile(error ? null : nextFile);
    setValidationError(error);
  }

  const error =
    validationError ??
    (mutation.error ? getReceiptErrorMessage(mutation.error) : null);

  return (
    <form
      className="space-y-4 rounded-lg border border-dashed border-border bg-muted/20 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (file) {
          mutation.mutate(file, { onSuccess: onUploaded });
        }
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        selectFile(event.dataTransfer.files[0] ?? null);
      }}
    >
      <div className="space-y-2">
        <Label htmlFor={inputId}>Archivo del comprobante</Label>
        <p className="text-sm text-muted-foreground">
          Arrastrá un PDF o imagen JPEG, PNG o WebP de hasta 10 MB.
        </p>
        <input
          id={inputId}
          type="file"
          accept={RECEIPT_FILE_ACCEPT}
          className="block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground"
          onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        />
      </div>
      {file && (
        <p className="text-sm text-foreground">
          Seleccionado: <span className="font-medium">{file.name}</span>
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={!file || mutation.isPending}>
        {mutation.isPending ? 'Cargando…' : 'Cargar y procesar OCR'}
      </Button>
    </form>
  );
}

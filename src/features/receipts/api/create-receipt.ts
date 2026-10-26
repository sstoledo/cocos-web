import { parseApiError } from '@/lib/api-error';
import type { Receipt, ReceiptMimeType } from '../types';

export const RECEIPT_FILE_MAX_SIZE = 10 * 1024 * 1024;
export const RECEIPT_FILE_TYPES: ReceiptMimeType[] = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];
export const RECEIPT_FILE_ACCEPT = RECEIPT_FILE_TYPES.join(',');

export function validateReceiptFile(file: File): string | null {
  if (!RECEIPT_FILE_TYPES.includes(file.type as ReceiptMimeType)) {
    return 'El comprobante debe ser un PDF o una imagen JPEG, PNG o WebP.';
  }
  if (file.size > RECEIPT_FILE_MAX_SIZE) {
    return 'El comprobante no puede superar los 10 MB.';
  }
  return null;
}

export async function createReceipt(file: File): Promise<Receipt> {
  const validationError = validateReceiptFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${import.meta.env.VITE_API_URL}/receipts`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw await parseApiError(response, 'Failed to upload receipt');
  }

  return (await response.json()) as Receipt;
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { confirmReceiptLot } from '../api/confirm-receipt-lot';
import { confirmReceiptPurchaseOrder } from '../api/confirm-receipt-purchase-order';
import { createReceipt } from '../api/create-receipt';
import { discardReceipt } from '../api/discard-receipt';
import { retryReceiptOcr } from '../api/retry-receipt-ocr';
import type {
  ConfirmReceiptLotPayload,
  ConfirmReceiptPurchaseOrderPayload,
} from '../types';

function useReceiptQueryInvalidation() {
  const queryClient = useQueryClient();
  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['receipts'] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['receipts', 'detail', id] });
    }
  };
}

export function useCreateReceipt() {
  const invalidate = useReceiptQueryInvalidation();
  return useMutation({
    mutationFn: createReceipt,
    onSuccess: (receipt) => {
      invalidate(receipt.id);
      toast.success('Comprobante cargado correctamente');
    },
  });
}

export function useDiscardReceipt() {
  const invalidate = useReceiptQueryInvalidation();
  return useMutation({
    mutationFn: discardReceipt,
    onSuccess: (receipt) => {
      invalidate(receipt.id);
      toast.success('Comprobante descartado');
    },
  });
}

export function useRetryReceiptOcr() {
  const invalidate = useReceiptQueryInvalidation();
  return useMutation({
    mutationFn: retryReceiptOcr,
    onSuccess: (receipt) => {
      invalidate(receipt.id);
      toast.success('Extracción OCR actualizada');
    },
  });
}

export function useConfirmReceiptLot() {
  const invalidate = useReceiptQueryInvalidation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: { id: string; payload: ConfirmReceiptLotPayload }) =>
      confirmReceiptLot(id, payload),
    onSuccess: ({ receipt }) => {
      invalidate(receipt.id);
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Comprobante confirmado y lote creado');
    },
  });
}

export function useConfirmReceiptPurchaseOrder() {
  const invalidate = useReceiptQueryInvalidation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ConfirmReceiptPurchaseOrderPayload;
    }) => confirmReceiptPurchaseOrder(id, payload),
    onSuccess: ({ receipt, purchaseOrder }) => {
      invalidate(receipt.id);
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({
        queryKey: ['purchase-order', purchaseOrder.id],
      });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Comprobante confirmado y recepción registrada');
    },
  });
}

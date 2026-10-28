import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReceiptUpload } from './ReceiptUpload';

const { mutationMock } = vi.hoisted(() => ({
  mutationMock: {
    mutate: vi.fn(),
    reset: vi.fn(),
    error: null as unknown,
    isPending: false,
  },
}));

vi.mock('../hooks/use-receipt-mutations', () => ({
  useCreateReceipt: () => mutationMock,
}));

describe('ReceiptUpload', () => {
  beforeEach(() => {
    mutationMock.mutate.mockReset();
    mutationMock.reset.mockReset();
    mutationMock.error = null;
    mutationMock.isPending = false;
  });

  it('shows the selected file and submits it for OCR', async () => {
    const user = userEvent.setup();
    render(<ReceiptUpload onUploaded={vi.fn()} />);
    const file = new File(['receipt'], 'receipt.png', { type: 'image/png' });

    await user.upload(screen.getByLabelText('Archivo del comprobante'), file);

    expect(screen.getByText('receipt.png')).toBeInTheDocument();
    const submit = screen.getByRole('button', {
      name: 'Cargar y procesar OCR',
    });
    expect(submit).toHaveClass('w-full', 'sm:w-auto');
    await user.click(submit);
    expect(mutationMock.mutate).toHaveBeenCalledWith(
      file,
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it('shows the pending OCR state', () => {
    mutationMock.isPending = true;
    render(<ReceiptUpload onUploaded={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Procesando OCR…' })
    ).toBeDisabled();
  });

  it('rejects invalid files without calling the mutation', async () => {
    const user = userEvent.setup();
    render(<ReceiptUpload onUploaded={vi.fn()} />);
    const file = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      'receipt.pdf',
      { type: 'application/pdf' }
    );

    await user.upload(screen.getByLabelText('Archivo del comprobante'), file);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(mutationMock.mutate).not.toHaveBeenCalled();
  });
});

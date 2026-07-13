import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductImageUpload } from './ProductImageUpload';

const onChange = vi.fn();
const onRemove = vi.fn();

describe('ProductImageUpload', () => {
  beforeEach(() => {
    onChange.mockReset();
    onRemove.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderUpload(props = {}) {
    return render(
      <ProductImageUpload onChange={onChange} onRemove={onRemove} {...props} />
    );
  }

  it('renders the file selection button', () => {
    renderUpload();

    expect(
      screen.getByRole('button', { name: 'Seleccionar imagen' })
    ).toBeInTheDocument();
  });

  it('shows the existing image preview when imageUrl is provided', () => {
    renderUpload({ imageUrl: 'https://example.com/product.jpg' });

    expect(screen.getByRole('img', { name: 'Vista previa' })).toHaveAttribute(
      'src',
      'https://example.com/product.jpg'
    );
    expect(
      screen.getByRole('button', { name: 'Cambiar imagen' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Eliminar imagen' })
    ).toBeInTheDocument();
  });

  it('calls onRemove when the existing image is removed', async () => {
    const user = userEvent.setup();
    renderUpload({ imageUrl: 'https://example.com/product.jpg' });

    await user.click(screen.getByRole('button', { name: 'Eliminar imagen' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('shows a new file preview and allows clearing it', async () => {
    const user = userEvent.setup();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();

    renderUpload();

    const file = new File(['image content'], 'product.png', {
      type: 'image/png',
    });
    const input = screen.getByLabelText('Imagen del producto');

    await user.upload(input, file);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(file);
    });

    expect(screen.getByRole('img', { name: 'Vista previa' })).toHaveAttribute(
      'src',
      'blob:preview'
    );
    expect(screen.getByRole('button', { name: 'Quitar' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quitar' }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows an error for invalid file types', async () => {
    renderUpload();

    const file = new File(['text content'], 'document.txt', {
      type: 'text/plain',
    });
    const input = screen.getByLabelText('Imagen del producto');

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByText(
        'El archivo debe ser una imagen (JPEG, PNG, WebP o GIF).'
      )
    ).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(null);
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { SupplierListFilters } from '../types';
import { SupplierFilters } from './SupplierFilters';

function renderFilters(
  props: {
    filters?: SupplierListFilters;
    onChange?: (filters: SupplierListFilters) => void;
  } = {}
) {
  return render(
    <SupplierFilters
      filters={props.filters ?? { q: '', isActive: undefined }}
      onChange={props.onChange ?? vi.fn()}
    />
  );
}

describe('SupplierFilters', () => {
  it('renders search input and state select', () => {
    renderFilters();
    expect(screen.getByLabelText('Buscar por nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Estado')).toBeInTheDocument();
  });

  it('calls onChange when query changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ onChange });

    const input = screen.getByLabelText('Buscar por nombre');
    await user.clear(input);
    await user.type(input, 'Proveedor');

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls.length).toBeGreaterThan(0);
  });

  it('calls onChange with isActive true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ onChange });

    await user.selectOptions(screen.getByLabelText('Estado'), 'true');

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({ q: '', isActive: true })
    );
  });

  it('calls onChange with isActive false', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ onChange });

    await user.selectOptions(screen.getByLabelText('Estado'), 'false');

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({ q: '', isActive: false })
    );
  });

  it('calls onChange with isActive undefined when "Todos" selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ onChange, filters: { q: '', isActive: true } });

    await user.selectOptions(screen.getByLabelText('Estado'), 'all');

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({ q: '', isActive: undefined })
    );
  });

  it('shows current filter values', () => {
    renderFilters({
      filters: { q: 'Test', isActive: true },
    });

    expect(screen.getByLabelText('Buscar por nombre')).toHaveValue('Test');
    expect(screen.getByRole('combobox')).toHaveValue('true');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { BrandListFilters } from '../types';
import { BrandFilters } from './BrandFilters';

function renderFilters(
  props: {
    filters?: BrandListFilters;
    onChange?: (f: BrandListFilters) => void;
  } = {}
) {
  return render(
    <MemoryRouter>
      <BrandFilters
        filters={props.filters ?? { q: '' }}
        onChange={props.onChange ?? vi.fn()}
      />
    </MemoryRouter>
  );
}

describe('BrandFilters', () => {
  it('renders search input', () => {
    renderFilters();
    expect(screen.getByLabelText('Buscar por nombre')).toBeInTheDocument();
  });

  it('calls onChange when search input changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ onChange });
    await user.type(screen.getByLabelText('Buscar por nombre'), 'Marca');
    // Just verify onChange was called (controlled component value updates in real app)
    expect(onChange).toHaveBeenCalled();
  });

  it('clears filter on empty input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ filters: { q: 'Marca' }, onChange });
    await user.clear(screen.getByLabelText('Buscar por nombre'));
    expect(onChange).toHaveBeenCalledWith({ q: undefined });
  });
});

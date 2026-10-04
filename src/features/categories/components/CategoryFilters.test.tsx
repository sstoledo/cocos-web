import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { CategoryListFilters } from '../types';
import { CategoryFilters } from './CategoryFilters';

function renderFilters(
  props: {
    filters?: CategoryListFilters;
    onChange?: (f: CategoryListFilters) => void;
  } = {}
) {
  return render(
    <MemoryRouter>
      <CategoryFilters
        filters={props.filters ?? { q: '' }}
        onChange={props.onChange ?? vi.fn()}
      />
    </MemoryRouter>
  );
}

describe('CategoryFilters', () => {
  it('renders search input', () => {
    renderFilters();
    expect(screen.getByLabelText('Buscar por nombre')).toBeInTheDocument();
  });

  it('calls onChange when search input changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ onChange });
    await user.type(screen.getByLabelText('Buscar por nombre'), 'Categoría');
    expect(onChange).toHaveBeenCalled();
  });

  it('clears filter on empty input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ filters: { q: 'Categoría' }, onChange });
    await user.clear(screen.getByLabelText('Buscar por nombre'));
    expect(onChange).toHaveBeenCalledWith({ q: undefined });
  });
});

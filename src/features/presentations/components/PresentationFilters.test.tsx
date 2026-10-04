import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { PresentationListFilters } from '../types';
import { PresentationFilters } from './PresentationFilters';

function renderFilters(
  props: {
    filters?: PresentationListFilters;
    onChange?: (f: PresentationListFilters) => void;
  } = {}
) {
  return render(
    <MemoryRouter>
      <PresentationFilters
        filters={props.filters ?? { q: '' }}
        onChange={props.onChange ?? vi.fn()}
      />
    </MemoryRouter>
  );
}

describe('PresentationFilters', () => {
  it('renders search input', () => {
    renderFilters();
    expect(screen.getByLabelText('Buscar por nombre')).toBeInTheDocument();
  });

  it('calls onChange when search input changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ onChange });
    await user.type(screen.getByLabelText('Buscar por nombre'), 'Presentación');
    expect(onChange).toHaveBeenCalled();
  });

  it('clears filter on empty input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ filters: { q: 'Presentación' }, onChange });
    await user.clear(screen.getByLabelText('Buscar por nombre'));
    expect(onChange).toHaveBeenCalledWith({ q: undefined });
  });
});

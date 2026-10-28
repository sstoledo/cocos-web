import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { Presentation } from '../types';
import { PresentationTable } from './PresentationTable';

const mockPresentations: Presentation[] = [
  {
    id: 'p1',
    name: 'Presentación 1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Presentación 2',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

function renderTable(
  props: {
    presentations?: Presentation[];
    canEdit?: boolean;
    onDelete?: (p: Presentation) => void;
  } = {}
) {
  const { presentations = [], canEdit = false, onDelete } = props;
  return render(
    <MemoryRouter>
      <PresentationTable
        presentations={presentations}
        canEdit={canEdit}
        onDelete={onDelete}
      />
    </MemoryRouter>
  );
}

describe('PresentationTable', () => {
  it('renders presentations in table', () => {
    renderTable({ presentations: mockPresentations });
    expect(screen.getAllByText('Presentación 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Presentación 2').length).toBeGreaterThan(0);
  });

  it('shows empty state when no presentations', () => {
    renderTable({ presentations: [] });
    expect(
      screen.getByText('No se encontraron presentaciones.')
    ).toBeInTheDocument();
  });

  it('renders the approved mobile presentation card', () => {
    renderTable({ presentations: [mockPresentations[0]], canEdit: true });

    expect(screen.getByTestId('presentation-mobile-card')).toHaveTextContent(
      'Presentación 1'
    );
  });

  it('shows edit and delete buttons when canEdit is true', () => {
    renderTable({ presentations: mockPresentations, canEdit: true });
    expect(screen.getAllByRole('link', { name: /Editar/ })).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: /Eliminar/ })).toHaveLength(4);
  });

  it('hides edit and delete buttons when canEdit is false', () => {
    renderTable({ presentations: mockPresentations, canEdit: false });
    expect(
      screen.queryByRole('link', { name: /Editar/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Eliminar/ })
    ).not.toBeInTheDocument();
  });
});

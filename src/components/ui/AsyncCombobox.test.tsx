import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AsyncCombobox, type AsyncComboboxOption } from './AsyncCombobox';

const allOptions: AsyncComboboxOption[] = [
  { value: 'a', label: 'Aceite 20W50' },
  { value: 'b', label: 'Filtro de aire' },
  { value: 'c', label: 'Pastillas de freno' },
];

type HarnessProps = {
  clearable?: boolean;
  isLoading?: boolean;
  initialValue?: AsyncComboboxOption | null;
  onValueChange?: (option: AsyncComboboxOption | null) => void;
};

function Harness({
  clearable = false,
  isLoading = false,
  initialValue = null,
  onValueChange,
}: HarnessProps) {
  const [search, setSearch] = useState('');
  const [value, setValue] = useState<AsyncComboboxOption | null>(initialValue);

  // Simulates the server: filter by the debounced term.
  const options = allOptions.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AsyncCombobox
      label="Producto"
      placeholder="Buscar producto…"
      options={options}
      value={value}
      onValueChange={(option) => {
        setValue(option);
        onValueChange?.(option);
      }}
      onSearchChange={setSearch}
      isLoading={isLoading}
      clearable={clearable}
    />
  );
}

describe('AsyncCombobox', () => {
  it('opens the popup and lists all options on focus', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText('Producto'));

    expect(
      await screen.findByRole('option', { name: 'Aceite 20W50' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Filtro de aire' })
    ).toBeInTheDocument();
  });

  it('filters options by the debounced search term', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText('Producto'));
    await user.type(screen.getByLabelText('Producto'), 'freno');

    expect(
      await screen.findByRole('option', { name: 'Pastillas de freno' })
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('option', { name: 'Aceite 20W50' })
      ).not.toBeInTheDocument()
    );
  });

  it('shows the empty message when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText('Producto'));
    await user.type(screen.getByLabelText('Producto'), 'zzz');

    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
  });

  it('shows a loading indicator while fetching', async () => {
    const user = userEvent.setup();
    render(<Harness isLoading />);

    await user.click(screen.getByLabelText('Producto'));

    expect(await screen.findByText('Cargando…')).toBeInTheDocument();
  });

  it('selects an option and keeps its label after clearing the search', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onValueChange={onValueChange} />);

    await user.click(screen.getByLabelText('Producto'));
    await user.type(screen.getByLabelText('Producto'), 'aire');
    await user.click(
      await screen.findByRole('option', { name: 'Filtro de aire' })
    );

    expect(onValueChange).toHaveBeenCalledWith({
      value: 'b',
      label: 'Filtro de aire',
    });
    expect(screen.getByLabelText('Producto')).toHaveValue('Filtro de aire');
  });

  it('renders the selected label even when it is not in the options', () => {
    render(
      <Harness initialValue={{ value: 'x', label: 'Producto archivado' }} />
    );

    expect(screen.getByLabelText('Producto')).toHaveValue('Producto archivado');
  });

  it('clears the selection with the clear button when clearable', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Harness
        clearable
        initialValue={{ value: 'a', label: 'Aceite 20W50' }}
        onValueChange={onValueChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Limpiar selección' }));

    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText('Producto')).toHaveValue('');
  });

  it('renders the error message and marks the input as invalid', () => {
    render(
      <AsyncCombobox
        label="Cliente"
        options={[]}
        value={null}
        onValueChange={() => {}}
        onSearchChange={() => {}}
        error="Seleccioná un cliente"
      />
    );

    expect(screen.getByLabelText('Cliente')).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByText('Seleccioná un cliente')).toBeInTheDocument();
  });
});

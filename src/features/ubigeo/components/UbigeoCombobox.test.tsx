import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UbigeoCombobox } from './UbigeoCombobox';

const MIRAFLORES = {
  code: '150122',
  department: 'Lima',
  province: 'Lima',
  district: 'Miraflores',
};

const AREQUIPA = {
  code: '040101',
  department: 'Arequipa',
  province: 'Arequipa',
  district: 'Arequipa',
};

const CATALOG = [MIRAFLORES, AREQUIPA];

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function Harness({
  initialCode = null,
  onChange,
}: {
  initialCode?: string | null;
  onChange?: (code: string | null) => void;
}) {
  const [code, setCode] = useState<string | null>(initialCode);

  return (
    <UbigeoCombobox
      label="Ubigeo"
      value={code}
      onChange={(next) => {
        setCode(next);
        onChange?.(next);
      }}
    />
  );
}

beforeEach(() => {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    const byCode = url.match(/\/ubigeos\/(\d{6})$/);

    if (byCode) {
      const found = CATALOG.find((entry) => entry.code === byCode[1]);
      return Promise.resolve(
        found
          ? { ok: true, json: () => Promise.resolve(found) }
          : { ok: false, status: 404 }
      );
    }

    const term = new URL(url).searchParams.get('query')?.toLowerCase() ?? '';
    const matches = CATALOG.filter((entry) =>
      `${entry.district} ${entry.province} ${entry.department}`
        .toLowerCase()
        .includes(term)
    );

    return Promise.resolve({ ok: true, json: () => Promise.resolve(matches) });
  });

  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

describe('UbigeoCombobox', () => {
  it('renders the label of the stored code', async () => {
    render(<Harness initialCode="150122" />, { wrapper });

    expect(
      await screen.findByDisplayValue('Miraflores, Lima, Lima (150122)')
    ).toBeInTheDocument();
  });

  it('searches the catalog and reports the selected code', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />, { wrapper });

    await user.click(screen.getByLabelText('Ubigeo'));
    await user.type(screen.getByLabelText('Ubigeo'), 'arequipa');

    await user.click(
      await screen.findByRole('option', {
        name: 'Arequipa, Arequipa, Arequipa (040101)',
      })
    );

    expect(onChange).toHaveBeenCalledWith('040101');
  });

  it('clears the selection', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness initialCode="150122" onChange={onChange} />, { wrapper });

    await screen.findByDisplayValue('Miraflores, Lima, Lima (150122)');
    await user.click(screen.getByRole('button', { name: 'Limpiar selección' }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});

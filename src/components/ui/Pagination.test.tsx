import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

const meta = { page: 2, total: 30, totalPages: 3 };

describe('Pagination', () => {
  it('renders current page and total pages', () => {
    render(<Pagination meta={meta} onPageChange={() => undefined} />);

    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
  });

  it('calls onPageChange with the previous page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination meta={meta} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: /anterior/i }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with the next page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination meta={meta} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables the previous button on the first page', () => {
    render(
      <Pagination
        meta={{ page: 1, total: 10, totalPages: 2 }}
        onPageChange={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
  });

  it('disables the next button on the last page', () => {
    render(
      <Pagination
        meta={{ page: 3, total: 30, totalPages: 3 }}
        onPageChange={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useResetPassword } from '../hooks/useResetPassword';
import { ResetPasswordPage } from './ResetPasswordPage';

vi.mock('../hooks/useResetPassword', () => ({
  useResetPassword: vi.fn(),
}));

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <ResetPasswordPage />
    </MemoryRouter>
  );
}

describe('ResetPasswordPage', () => {
  const mutate = vi.fn((_values, options) => {
    options?.onSuccess?.();
  });

  beforeEach(() => {
    mutate.mockClear();
    vi.mocked(useResetPassword).mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useResetPassword>);
  });

  it('renders header, email field, submit button and link to login', () => {
    renderWithRouter();

    expect(
      screen.getByRole('heading', { name: /reset password/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/enter your email to receive a reset link/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('calls useResetPassword.mutate with email on valid submit', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { email: 'user@example.com' },
        expect.any(Object)
      )
    );
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows error message on reset request failure', () => {
    vi.mocked(useResetPassword).mockReturnValue({
      mutate,
      isPending: false,
      error: new Error('User not found'),
    } as unknown as ReturnType<typeof useResetPassword>);

    renderWithRouter();

    expect(screen.getByText('User not found')).toBeInTheDocument();
  });

  it('shows success message after submitting', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(
      await screen.findByText(/check your email for a reset link/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /send reset link/i })
    ).not.toBeInTheDocument();
  });
});

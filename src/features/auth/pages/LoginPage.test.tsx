import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLogin } from '../hooks/useLogin';
import { LoginPage } from './LoginPage';

const navigateMock = vi.fn();

vi.mock('../hooks/useLogin', () => ({
  useLogin: vi.fn(),
}));

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  const mutate = vi.fn((_values, options) => {
    options?.onSuccess?.();
  });

  beforeEach(() => {
    mutate.mockClear();
    navigateMock.mockClear();
    vi.mocked(useLogin).mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useLogin>);
  });

  it('renders header, email and password fields and submit button', () => {
    renderWithRouter();

    expect(
      screen.getByRole('heading', { name: /welcome back/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it('calls useLogin.mutate with form values on valid submit', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { email: 'user@example.com', password: 'password123' },
        expect.any(Object)
      )
    );
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
  });

  it('shows error message on login failure', () => {
    vi.mocked(useLogin).mockReturnValue({
      mutate,
      isPending: false,
      error: new Error('Invalid credentials'),
    } as unknown as ReturnType<typeof useLogin>);

    renderWithRouter();

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('navigates to /dashboard on success', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/dashboard')
    );
  });
});

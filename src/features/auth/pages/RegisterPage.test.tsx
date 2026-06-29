import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRegister } from '../hooks/useRegister';
import { RegisterPage } from './RegisterPage';

const navigateMock = vi.fn();

vi.mock('../hooks/useRegister', () => ({
  useRegister: vi.fn(),
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
      <RegisterPage />
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  const mutate = vi.fn((_values, options) => {
    options?.onSuccess?.();
  });

  beforeEach(() => {
    mutate.mockClear();
    navigateMock.mockClear();
    vi.mocked(useRegister).mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useRegister>);
  });

  it('renders header, name, email and password fields and submit button', () => {
    renderWithRouter();

    expect(
      screen.getByRole('heading', { name: /create account/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/get started with cocos/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
  });

  it('calls useRegister.mutate with form values on valid submit', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText('Full name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          name: 'Test User',
          email: 'user@example.com',
          password: 'password123',
        },
        expect.any(Object)
      )
    );
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText(/full name is required/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
  });

  it('shows error message on registration failure', () => {
    vi.mocked(useRegister).mockReturnValue({
      mutate,
      isPending: false,
      error: new Error('Email already in use'),
    } as unknown as ReturnType<typeof useRegister>);

    renderWithRouter();

    expect(screen.getByText('Email already in use')).toBeInTheDocument();
  });

  it('navigates to /dashboard on success', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByLabelText('Full name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/dashboard')
    );
  });
});

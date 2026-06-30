import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AuthLayout } from './AuthLayout';

function renderWithChild() {
  return render(
    <MemoryRouter initialEntries={['/test']}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="test" element={<div>Child content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthLayout', () => {
  it('renders the theme toggle', () => {
    renderWithChild();

    expect(
      screen.getByRole('button', { name: /toggle theme/i })
    ).toBeInTheDocument();
  });

  it('renders child content passed via Outlet', () => {
    renderWithChild();

    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});

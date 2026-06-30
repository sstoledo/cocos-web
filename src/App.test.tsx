import App from '@/App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/shell/hooks/useUser', () => ({
  useUser: () => ({
    user: {
      id: '1',
      name: 'Ana',
      email: 'ana@example.com',
      role: { id: 'r1', name: 'Admin' },
    },
    isLoading: false,
    error: null,
  }),
}));

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function renderApp() {
  return render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );
}

describe('App', () => {
  it('renders without crashing', () => {
    renderApp();
    expect(document.body).toBeInTheDocument();
  });

  it('shows the shell brand', () => {
    renderApp();
    expect(screen.getAllByText('Cocos').length).toBeGreaterThanOrEqual(1);
  });
});

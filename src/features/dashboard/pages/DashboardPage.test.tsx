import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

const useDashboardStatsMock = vi.fn();
const useRecentActivityMock = vi.fn();

vi.mock('../hooks/useDashboardStats', () => ({
  useDashboardStats: () => useDashboardStatsMock(),
}));

vi.mock('../hooks/useRecentActivity', () => ({
  useRecentActivity: () => useRecentActivityMock(),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    useDashboardStatsMock.mockReset();
    useRecentActivityMock.mockReset();
  });

  it('renders the dashboard title and stat cards while loading', () => {
    useDashboardStatsMock.mockReturnValue({ stats: [], isLoading: true });
    useRecentActivityMock.mockReturnValue({ activities: [], isLoading: true });

    render(<DashboardPage />);

    expect(
      screen.getByRole('heading', { name: 'Dashboard' })
    ).toBeInTheDocument();
    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getByText('Órdenes')).toBeInTheDocument();
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Actividad reciente' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: /cargando estadísticas/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: /cargando actividad/i })
    ).toBeInTheDocument();
  });

  it('shows zero values and an empty activity message when data is empty', () => {
    useDashboardStatsMock.mockReturnValue({ stats: [], isLoading: false });
    useRecentActivityMock.mockReturnValue({ activities: [], isLoading: false });

    render(<DashboardPage />);

    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getByText('Órdenes')).toBeInTheDocument();
    expect(screen.getByText('Ventas')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByText('No hay actividad reciente.')).toBeInTheDocument();
  });

  it('renders real stats and recent activity', () => {
    useDashboardStatsMock.mockReturnValue({
      stats: [
        { label: 'Resumen', value: 12 },
        { label: 'Órdenes', value: 8 },
        { label: 'Ventas', value: 5 },
      ],
      isLoading: false,
    });
    useRecentActivityMock.mockReturnValue({
      activities: [
        { id: 'a1', description: 'Orden #1 creada', time: '10:30' },
        { id: 'a2', description: 'Venta #2 finalizada', time: '11:00' },
      ],
      isLoading: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Orden #1 creada')).toBeInTheDocument();
    expect(screen.getByText('Venta #2 finalizada')).toBeInTheDocument();
    expect(screen.getByText('10:30')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });
});

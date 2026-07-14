import { cn } from '@/lib/utils';
import type { Vehicle } from '../types';

export type VehicleListProps = {
  vehicles: Vehicle[];
};

export function VehicleList({ vehicles }: VehicleListProps) {
  const activeVehicles = vehicles.filter((vehicle) => vehicle.isActive);

  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-body-sm">
        <thead className="border-b border-border">
          <tr className="text-left">
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Placa
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Marca
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Modelo
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">Año</th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Color
            </th>
            <th className="h-12 px-4 font-medium text-muted-foreground">
              Notas
            </th>
          </tr>
        </thead>
        <tbody>
          {activeVehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="p-4 font-medium text-foreground">
                {vehicle.plate}
              </td>
              <td className="p-4 text-muted-foreground">{vehicle.brand}</td>
              <td className="p-4 text-muted-foreground">{vehicle.model}</td>
              <td className="p-4 text-muted-foreground">
                {vehicle.year ?? '—'}
              </td>
              <td className="p-4 text-muted-foreground">
                {vehicle.color ?? '—'}
              </td>
              <td
                className={cn('p-4 text-muted-foreground', 'max-w-xs truncate')}
              >
                {vehicle.notes ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {activeVehicles.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          No se encontraron vehículos.
        </p>
      )}
    </div>
  );
}

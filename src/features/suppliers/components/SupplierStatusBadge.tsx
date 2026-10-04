import { cn } from '@/lib/utils';

export function SupplierStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        isActive
          ? 'bg-green-100 text-green-800 border-green-200'
          : 'bg-gray-100 text-gray-800 border-gray-200'
      )}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

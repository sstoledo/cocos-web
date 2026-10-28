export function SupplierStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-caption font-semibold ${
        isActive
          ? 'bg-success text-success-foreground'
          : 'bg-destructive text-destructive-foreground'
      }`}
    >
      {isActive ? 'Activo' : 'Inactivo'}
    </span>
  );
}

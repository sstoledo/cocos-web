import { cn } from '@/lib/utils';
import { Combobox } from '@base-ui/react/combobox';
import { IconAlertCircle, IconX } from '@tabler/icons-react';
import { useEffect, useId, useRef, useState } from 'react';

export type AsyncComboboxOption = {
  value: string;
  label: string;
};

export type AsyncComboboxProps = {
  id?: string;
  label?: string;
  // Accessible name when no visible label is rendered (e.g. filter bars).
  ariaLabel?: string;
  error?: string;
  placeholder?: string;
  options: AsyncComboboxOption[];
  // The selected option. It does NOT need to be present in `options`: the
  // label renders from this prop so a value survives across searches.
  value: AsyncComboboxOption | null;
  onValueChange: (option: AsyncComboboxOption | null) => void;
  // Called with the debounced (~300ms) search term.
  onSearchChange: (search: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  emptyMessage?: string;
};

const SEARCH_DEBOUNCE_MS = 300;

function isSameOption(
  item: AsyncComboboxOption,
  value: AsyncComboboxOption
): boolean {
  return item.value === value.value;
}

// Server-filtered combobox: `options` are rendered as-is (filter={null}),
// so the parent is responsible for fetching them from the backend.
export function AsyncCombobox({
  id,
  label,
  ariaLabel,
  error,
  placeholder,
  options,
  value,
  onValueChange,
  onSearchChange,
  isLoading = false,
  disabled = false,
  clearable = false,
  emptyMessage = 'Sin resultados',
}: AsyncComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  const [inputValue, setInputValue] = useState('');
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  // Debounce the search term. When the input shows the selected label
  // (base-ui fills it on selection), reset the search instead of
  // re-filtering by the label text.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (value && inputValue === value.label) {
        onSearchChangeRef.current('');
      } else {
        onSearchChangeRef.current(inputValue);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [inputValue, value]);

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium text-foreground',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {label}
        </label>
      )}
      <Combobox.Root<AsyncComboboxOption>
        items={options}
        value={value}
        onValueChange={(next) => onValueChange(next ?? null)}
        onInputValueChange={(next) => setInputValue(next)}
        filter={null}
        isItemEqualToValue={isSameOption}
        disabled={disabled}
      >
        <div className="relative">
          <Combobox.Input
            id={inputId}
            aria-label={ariaLabel}
            placeholder={placeholder}
            className={cn(
              'flex h-10 w-full rounded-md border border-border bg-card px-3 py-2',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              clearable && value && 'pr-9',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={errorId}
          />
          {clearable && value && !disabled && (
            <Combobox.Clear
              aria-label="Limpiar selección"
              className={cn(
                'absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1',
                'text-muted-foreground hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              <IconX className="h-4 w-4" />
            </Combobox.Clear>
          )}
        </div>
        <Combobox.Portal>
          <Combobox.Positioner className="z-50" sideOffset={4}>
            <Combobox.Popup
              className={cn(
                'max-h-60 w-[var(--anchor-width)] overflow-auto rounded-md',
                'border border-border bg-card p-1 shadow-md'
              )}
            >
              {isLoading ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Cargando…
                </div>
              ) : (
                <Combobox.Empty className="px-3 py-2 text-sm text-muted-foreground">
                  {emptyMessage}
                </Combobox.Empty>
              )}
              <Combobox.List>
                {(option: AsyncComboboxOption) => (
                  <Combobox.Item
                    key={option.value}
                    value={option}
                    className={cn(
                      'cursor-pointer rounded-sm px-3 py-2 text-sm text-foreground',
                      'data-[highlighted]:bg-muted',
                      'data-[selected]:font-medium'
                    )}
                  >
                    {option.label}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
      {error && (
        <p
          id={errorId}
          className="flex items-center gap-1 text-sm text-destructive"
        >
          <IconAlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

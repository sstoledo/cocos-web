import { lookupRuc } from '@/features/sunat/api/lookup-ruc';
import type { RucLookupState } from '@/features/sunat/types';
import { isValidRuc } from '@/lib/ruc';
import { useEffect, useRef, useState } from 'react';

const DEBOUNCE_MS = 600;

/**
 * Looks up a RUC in the SUNAT padrón whenever the given identification is a
 * syntactically valid RUC. Debounced and deduplicated per RUC value — the
 * ref is marked when the request starts, so repeated renders or re-typed
 * identical RUCs do not refetch. Failures are non-blocking for the caller.
 */
export function useRucLookup(
  identificationType: string,
  identification: string
): RucLookupState {
  const [state, setState] = useState<RucLookupState>({ status: 'idle' });
  const fetchedRucRef = useRef<string | null>(null);

  useEffect(() => {
    const ruc = identification.trim();

    if (identificationType !== 'RUC' || !isValidRuc(ruc)) {
      fetchedRucRef.current = null;
      setState({ status: 'idle' });
      return;
    }

    if (fetchedRucRef.current === ruc) {
      return;
    }

    const timer = setTimeout(() => {
      fetchedRucRef.current = ruc;
      setState({ status: 'loading' });
      lookupRuc(ruc)
        .then((result) => {
          setState({ status: 'found', result });
        })
        .catch((error: Error) => {
          setState({ status: 'error', message: error.message });
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [identificationType, identification]);

  return state;
}

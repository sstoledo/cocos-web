export type RucLookupResult = {
  ruc: string;
  razonSocial: string;
  direccion: string | null;
  estado: string | null;
  condicion: string | null;
};

export type RucLookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; result: RucLookupResult }
  | { status: 'error'; message: string };

/** Result of POST /api/sales/:id/emit. */
export type EmissionResult = {
  serie: string;
  correlativo: number;
  sunatStatus: 'accepted' | 'rejected';
  description: string | null;
};

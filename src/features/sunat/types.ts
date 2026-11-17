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

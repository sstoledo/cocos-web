export type CompanySettings = {
  id: string;
  ruc: string | null;
  legalName: string | null;
  address: string | null;
  /** INEI 6-digit ubigeo of the fiscal domicile. */
  ubigeo: string | null;
  facturaSeries: string;
  boletaSeries: string;
  createdAt: string;
  updatedAt: string;
};

export type CompanySettingsPayload = {
  ruc?: string;
  legalName?: string;
  address?: string;
  ubigeo?: string;
  facturaSeries?: string;
  boletaSeries?: string;
};

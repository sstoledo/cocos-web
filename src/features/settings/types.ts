export type CompanySettings = {
  id: string;
  ruc: string | null;
  legalName: string | null;
  address: string | null;
  facturaSeries: string;
  boletaSeries: string;
  createdAt: string;
  updatedAt: string;
};

export type CompanySettingsPayload = {
  ruc?: string;
  legalName?: string;
  address?: string;
  facturaSeries?: string;
  boletaSeries?: string;
};

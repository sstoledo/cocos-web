import type { CompanySettings } from '../types';

export async function getCompanySettings(): Promise<CompanySettings> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/settings/company`,
    {
      credentials: 'include',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch company settings: ${response.status}`);
  }

  return (await response.json()) as CompanySettings;
}

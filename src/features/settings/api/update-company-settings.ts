import type { CompanySettings, CompanySettingsPayload } from '../types';

export async function updateCompanySettings(
  values: CompanySettingsPayload
): Promise<CompanySettings> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/settings/company`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update company settings: ${response.status}`);
  }

  return (await response.json()) as CompanySettings;
}

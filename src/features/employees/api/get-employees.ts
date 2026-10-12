import type { Employee } from '../types';

export async function getEmployees(): Promise<Employee[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/employees`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.status}`);
  }

  return (await response.json()) as Employee[];
}

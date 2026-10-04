export interface Presentation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationListFilters {
  q?: string;
}

export type { PresentationFormValues } from './schemas/presentation-schema';

export interface Presentation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationListFilters {
  q?: string;
}

export interface PresentationListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PresentationListResponse {
  data: Presentation[];
  meta: PresentationListMeta;
}

export type { PresentationFormValues } from './schemas/presentation-schema';

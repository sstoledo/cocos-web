export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  parent?: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListFilters {
  q?: string;
}

export interface CategoryListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface CategoryListResponse {
  data: Category[];
  meta: CategoryListMeta;
}

export type { CategoryFormValues } from './schemas/category-schema';

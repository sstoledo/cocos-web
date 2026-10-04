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

export type { CategoryFormValues } from './schemas/category-schema';

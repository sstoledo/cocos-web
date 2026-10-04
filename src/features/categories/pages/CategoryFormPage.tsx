import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { getCategories } from '../api/get-categories';
import { CategoryForm } from '../components/CategoryForm';
import { useCategory } from '../hooks/use-category';
import { useCreateCategory } from '../hooks/use-create-category';
import { useUpdateCategory } from '../hooks/use-update-category';
import type { Category, CategoryFormValues } from '../types';

function categoryToFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    parentId: category.parentId ?? null,
  };
}

export function CategoryFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Fetch all categories for the parent dropdown
  const { data: allCategories = [], isLoading: isLoadingCategories } = useQuery(
    {
      queryKey: ['categories', 'all'],
      queryFn: () => getCategories({}),
    }
  );

  const {
    data: category,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useCategory(id ?? '');

  const {
    mutate: createCategory,
    isPending: isCreating,
    error: createError,
  } = useCreateCategory();

  const {
    mutate: updateCategory,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateCategory();

  function handleSubmit(values: CategoryFormValues) {
    if (isEditMode && id) {
      updateCategory(
        { id, values },
        { onSuccess: () => navigate('/categories') }
      );
    } else {
      createCategory(values, { onSuccess: () => navigate('/categories') });
    }
  }

  const isPending = isCreating || isUpdating;
  const mutationError = isEditMode ? updateError : createError;

  const errorMessage = mutationError
    ? isEditMode
      ? 'No se pudo actualizar la categoría. Intentá de nuevo más tarde.'
      : 'No se pudo crear la categoría. Intentá de nuevo más tarde.'
    : null;

  // In edit mode, exclude current category from parent options
  const currentCategoryId = isEditMode ? id : undefined;

  return (
    <>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar categoría' : 'Nueva categoría'}
        </PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información de la categoría">
          {(isEditMode && isLoadingCategory) || isLoadingCategories ? (
            <output className="block py-8 text-center text-muted-foreground">
              Cargando…
            </output>
          ) : isEditMode && categoryError ? (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              No se pudieron cargar los datos. Intentá de nuevo más tarde.
            </div>
          ) : (
            <>
              {errorMessage && (
                <div
                  className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}
              <CategoryForm
                key={category?.id ?? 'create'}
                onSubmit={handleSubmit}
                isPending={isPending}
                initialValues={
                  isEditMode && category
                    ? categoryToFormValues(category)
                    : undefined
                }
                categories={allCategories}
                currentCategoryId={currentCategoryId}
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}

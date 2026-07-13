import { PageContent } from '@/components/ui/PageContent';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageTitle } from '@/components/ui/PageTitle';
import { SectionCard } from '@/components/ui/SectionCard';
import { useNavigate, useParams } from 'react-router';
import { ProductForm } from '../components/ProductForm';
import { useCreateProduct } from '../hooks/use-create-product';
import { useProduct } from '../hooks/use-product';
import { useProductReferences } from '../hooks/use-product-references';
import { useRemoveProductImage } from '../hooks/use-remove-product-image';
import { useUpdateProduct } from '../hooks/use-update-product';
import type { Product, ProductFormValues } from '../types';

function productToFormValues(product: Product): ProductFormValues {
  return {
    code: product.code,
    name: product.name,
    description: product.description ?? '',
    price: Number(product.price),
    presentationId: product.presentation.id,
    brandId: product.brand.id,
    categoryId: product.category.id,
    barcode: product.barcode ?? '',
    taxRate: product.taxRate ? Number(product.taxRate) : undefined,
    notes: product.notes ?? '',
    isActive: product.isActive,
  };
}

export function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    presentations,
    brands,
    categories,
    isLoading: isLoadingReferences,
    error: referencesError,
  } = useProductReferences();

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: productError,
  } = useProduct(id ?? '');

  const {
    mutate: createProduct,
    isPending: isCreating,
    error: createError,
  } = useCreateProduct();

  const {
    mutate: updateProduct,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateProduct();

  const { mutate: removeProductImage, isPending: isRemovingImage } =
    useRemoveProductImage();

  function handleSubmit(values: ProductFormValues, image: File | null) {
    if (isEditMode && id) {
      updateProduct(
        { id, values, image: image ?? undefined },
        {
          onSuccess: () => {
            navigate('/products');
          },
        }
      );
    } else {
      createProduct(
        { values, image: image ?? undefined },
        {
          onSuccess: () => {
            navigate('/products');
          },
        }
      );
    }
  }

  function handleRemoveImage() {
    if (id) {
      removeProductImage(id);
    }
  }

  const isPending = isCreating || isUpdating || isRemovingImage;
  const mutationError = isEditMode ? updateError : createError;

  const errorMessage = mutationError
    ? isEditMode
      ? 'No se pudo actualizar el producto. Intentá de nuevo más tarde.'
      : 'No se pudo crear el producto. Intentá de nuevo más tarde.'
    : null;

  const isLoading = isEditMode
    ? isLoadingReferences || isLoadingProduct
    : isLoadingReferences;

  const fatalError = isEditMode
    ? referencesError || productError
    : referencesError;

  const loadingMessage = isEditMode ? 'Cargando…' : 'Cargando catálogos…';

  const fatalErrorMessage = isEditMode
    ? 'No se pudieron cargar los datos. Intentá de nuevo más tarde.'
    : 'No se pudieron cargar los catálogos. Intentá de nuevo más tarde.';

  return (
    <>
      <PageHeader>
        <PageTitle>
          {isEditMode ? 'Editar producto' : 'Nuevo producto'}
        </PageTitle>
      </PageHeader>
      <PageContent>
        <SectionCard title="Información del producto">
          {isLoading ? (
            <output className="block py-8 text-center text-muted-foreground">
              {loadingMessage}
            </output>
          ) : fatalError ? (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive"
              role="alert"
            >
              {fatalErrorMessage}
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
              <ProductForm
                onSubmit={handleSubmit}
                presentations={presentations}
                brands={brands}
                categories={categories}
                isPending={isPending}
                initialValues={
                  isEditMode && product
                    ? productToFormValues(product)
                    : undefined
                }
                imageUrl={product?.imageUrl}
                onRemoveImage={isEditMode ? handleRemoveImage : undefined}
              />
            </>
          )}
        </SectionCard>
      </PageContent>
    </>
  );
}

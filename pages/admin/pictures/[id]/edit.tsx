import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatCurrency } from "@/utils/formatCurrency";
import { Toaster, toast } from "react-hot-toast";
import { getPictureStatus } from "@/domain/picture";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { usePicture, useUpdatePicture } from "@/hooks/usePictures";
import { 
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";

type AdminPicture = {
  id: string;
  title: string;
  description?: string;
  price: number;
  size: string;
  slug: string;
  imageUrl: string;
  productTypeId: string;
  productTypeName: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

type ProductType = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
};

// Status is now computed from stock field - no longer needed

export default function EditPicture() {
  const router = useRouter();
  const { id } = router.query;
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    size: '',
    slug: '',
    productTypeId: '',
    stock: '',
    imageUrl: '',
  });

  // Use React Query hooks
  const { data: picture, isLoading: loading, error } = usePicture(typeof id === 'string' ? id : '');
  const updatePictureMutation = useUpdatePicture();

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const response = await fetch('/api/admin/product-types');
        if (response.ok) {
          const data = await response.json();
          setProductTypes(data.productTypes);
        }
      } catch (error) {
        console.error('Error fetching product types:', error);
      }
    };

    fetchProductTypes();
  }, []);

  // Update form data when picture is loaded
  useEffect(() => {
    if (picture) {
      setFormData({
        title: picture.title || '',
        description: picture.description || '',
        price: picture.price?.toString() || '0',
        size: picture.size || '',
        slug: picture.slug || '',
        productTypeId: picture.productTypeId || '',
        stock: picture.stock?.toString() || '1',
        imageUrl: picture.imageUrl || '',
      });
    }
  }, [picture]);

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error('Error al cargar el cuadro');
      router.push('/admin/pictures');
    }
  }, [error, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!picture) return;
    
    try {
      await updatePictureMutation.mutateAsync({
        id: picture.id,
        data: {
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 1,
        }
      });
      
      toast.success('Cuadro actualizado correctamente');
      router.push('/admin/pictures');
    } catch (error) {
      console.error('Error updating picture:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el cuadro');
    }
  };

  const handleDelete = async () => {
    if (!picture) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar "${picture.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/pictures/${picture.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar el cuadro');
      }
      
      toast.success('Cuadro eliminado correctamente');
      router.push('/admin/pictures');
    } catch (error) {
      console.error('Error deleting picture:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el cuadro');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Cargando... - Admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!picture) {
    return (
      <AdminLayout title="Cuadro no encontrado - Admin">
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Cuadro no encontrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            El cuadro que buscas no existe.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/pictures"
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-900 cursor-pointer"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver a Cuadros
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Editar ${picture.title} - Admin`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/pictures"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 cursor-pointer"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Volver a Cuadros
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Cuadro
            </h1>
          </div>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Eliminar Cuadro
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
              <Input
                label="Título *"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <Textarea
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />

              <Select
                label="Tipo de Producto *"
                value={formData.productTypeId}
                onChange={(e) => setFormData({ ...formData, productTypeId: e.target.value })}
                required
              >
                <option value="">Selecciona un tipo</option>
                {productTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.displayName}
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Precio (€) *"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />

                <Input
                  label="Stock *"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  placeholder="1"
                />

                <Input
                  label="Tamaño"
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="120x90 cm"
                />
              </div>

              <div>
                <Input
                  label="URL slug *"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /products/{formData.slug}
                </p>
              </div>


              <ImageUpload
                currentImageUrl={formData.imageUrl}
                onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                onImageRemoved={() => setFormData({ ...formData, imageUrl: '' })}
              />

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Link
                  href="/admin/pictures"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={updatePictureMutation.isPending}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {updatePictureMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vista Previa
              </h3>
              
              {formData.imageUrl && (
                <div className="mb-4">
                  <img
                    src={formData.imageUrl}
                    alt={formData.title}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{formData.title || 'Sin título'}</h4>
                  <p className="text-sm text-gray-500">{formData.size || 'Sin tamaño'}</p>
                  <p className="text-sm text-gray-900">
                    {productTypes.find(t => t.id === formData.productTypeId)?.displayName || 'Sin tipo'}
                  </p>
                </div>
                
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {formData.price ? formatCurrency(Math.round(parseFloat(formData.price) * 100)) : '€0.00'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      parseInt(formData.stock) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {parseInt(formData.stock) > 0 ? 'Disponible' : 'No disponible'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Stock: {formData.stock || 0}
                    </span>
                  </div>
                </div>
                
                {formData.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-mono text-gray-900">{picture.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Creado:</span>
                  <span className="text-gray-900">
                    {new Date(picture.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Actualizado:</span>
                  <span className="text-gray-900">
                    {new Date(picture.updatedAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Toaster position="top-right" />
      </div>
    </AdminLayout>
  );
}
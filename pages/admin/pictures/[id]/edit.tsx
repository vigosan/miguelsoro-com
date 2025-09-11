import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatCurrency } from "@/utils/formatCurrency";
import { Toaster, toast } from "react-hot-toast";
import { 
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

type AdminPicture = {
  id: string;
  title: string;
  description?: string;
  price: number;
  size: string;
  slug: string;
  imageUrl: string;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED';
  createdAt: string;
  updatedAt: string;
};

const statusOptions = [
  { value: 'AVAILABLE', label: 'Disponible', color: 'bg-green-100 text-green-800' },
  { value: 'SOLD', label: 'Vendido', color: 'bg-gray-100 text-gray-800' },
  { value: 'RESERVED', label: 'Reservado', color: 'bg-yellow-100 text-yellow-800' },
];

export default function EditPicture() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picture, setPicture] = useState<AdminPicture | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    size: '',
    slug: '',
    status: 'AVAILABLE' as const,
  });

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchPicture = async () => {
      try {
        const response = await fetch(`/api/admin/pictures/${id}`);
        
        if (response.status === 404) {
          toast.error('Cuadro no encontrado');
          router.push('/admin/pictures');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Error al cargar el cuadro');
        }
        
        const data = await response.json();
        setPicture(data.picture);
        setFormData({
          title: data.picture.title,
          description: data.picture.description || '',
          price: (data.picture.price / 100).toString(), // Convert cents to euros
          size: data.picture.size,
          slug: data.picture.slug,
          status: data.picture.status,
        });
      } catch (error) {
        console.error('Error fetching picture:', error);
        toast.error('Error al cargar el cuadro');
        router.push('/admin/pictures');
      } finally {
        setLoading(false);
      }
    };

    fetchPicture();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!picture) return;
    
    setSaving(true);
    
    try {
      const response = await fetch(`/api/admin/pictures/${picture.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Math.round(parseFloat(formData.price) * 100), // Convert euros to cents
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el cuadro');
      }
      
      toast.success('Cuadro actualizado correctamente');
      router.push('/admin/pictures');
    } catch (error) {
      console.error('Error updating picture:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el cuadro');
    } finally {
      setSaving(false);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
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
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="120x90 cm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /products/{formData.slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Link
                  href="/admin/pictures"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
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
              
              {picture.imageUrl && (
                <div className="mb-4">
                  <img
                    src={picture.imageUrl}
                    alt={picture.title}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{formData.title || 'Sin título'}</h4>
                  <p className="text-sm text-gray-500">{formData.size || 'Sin tamaño'}</p>
                </div>
                
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {formData.price ? formatCurrency(parseFloat(formData.price) * 100) : '€0.00'}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusOptions.find(opt => opt.value === formData.status)?.color
                  }`}>
                    {statusOptions.find(opt => opt.value === formData.status)?.label}
                  </span>
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
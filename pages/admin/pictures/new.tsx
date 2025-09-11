import { useState } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatCurrency } from "@/utils/formatCurrency";
import { Toaster, toast } from "react-hot-toast";
import { slugify } from "@/utils/slug";
import { 
  ArrowLeftIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

const statusOptions = [
  { value: 'AVAILABLE', label: 'Disponible', color: 'bg-green-100 text-green-800' },
  { value: 'SOLD', label: 'Vendido', color: 'bg-gray-100 text-gray-800' },
  { value: 'RESERVED', label: 'Reservado', color: 'bg-yellow-100 text-yellow-800' },
];

export default function NewPicture() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    size: '',
    slug: '',
    status: 'AVAILABLE' as const,
  });

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug === '' ? slugify(title) : prev.slug // Auto-generate slug only if empty
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    
    try {
      // For now, we'll show a not implemented message
      // This would require creating the full product creation flow
      toast.error('La creación de cuadros no está implementada aún. Use el seed para datos de prueba.');
    } catch (error) {
      console.error('Error creating picture:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el cuadro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Añadir Cuadro - Admin">
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
              Añadir Nuevo Cuadro
            </h1>
          </div>
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
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="Ej: Eddy Merckx - El Canibal"
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
                  placeholder="Descripción del cuadro..."
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
                    placeholder="450.00"
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
                  placeholder="eddy-merckx-el-canibal"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /products/{formData.slug || 'url-del-cuadro'}
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

              {/* Image Upload Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    La subida de imágenes no está implementada aún
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Por ahora, las imágenes deben añadirse manualmente a /public/pictures/
                  </p>
                </div>
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
                  {saving ? 'Creando...' : 'Crear Cuadro'}
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
              
              <div className="mb-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              </div>

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

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">
                🚧 En Desarrollo
              </h3>
              <p className="text-sm text-yellow-700">
                La creación de cuadros requiere implementar el sistema completo de productos, variantes e imágenes. 
                Por ahora, usa el comando <code className="bg-yellow-100 px-1 rounded">make seed</code> para datos de prueba.
              </p>
            </div>
          </div>
        </div>

        <Toaster position="top-right" />
      </div>
    </AdminLayout>
  );
}
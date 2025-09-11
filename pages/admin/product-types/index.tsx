import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Toaster, toast } from "react-hot-toast";
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

type ProductType = {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
};

export default function ProductTypesAdmin() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    description: '',
  });

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/product-types');
      
      if (!response.ok) {
        throw new Error('Failed to fetch product types');
      }
      
      const data = await response.json();
      setProductTypes(data.productTypes);
    } catch (error) {
      console.error('Error fetching product types:', error);
      toast.error('Error al cargar los tipos de producto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.displayName.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    try {
      const response = await fetch('/api/admin/product-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el tipo de producto');
      }
      
      toast.success('Tipo de producto creado correctamente');
      setFormData({ displayName: '', description: '' });
      setShowCreateForm(false);
      fetchProductTypes();
    } catch (error) {
      console.error('Error creating product type:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear el tipo de producto');
    }
  };

  const handleEdit = (productType: ProductType) => {
    setEditingType(productType);
    setFormData({
      displayName: productType.displayName,
      description: productType.description || '',
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingType(null);
    setFormData({ displayName: '', description: '' });
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Tipos de Producto - Admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Tipos de Producto - Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tipos de Producto</h1>
            <p className="mt-2 text-gray-600">
              Gestiona las categorías de productos (Cuadros, Reproducciones, Camisetas, etc.)
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Tipo
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingType ? 'Editar Tipo de Producto' : 'Crear Nuevo Tipo de Producto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Tipo *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ej: Reproducciones de Alta Calidad"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Se generará automáticamente un nombre interno: {formData.displayName ? formData.displayName.toLowerCase().replace(/\s+/g, '-') : ''}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Descripción del tipo de producto..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingType ? 'Actualizar' : 'Crear'} Tipo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product Types List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Tipos de Producto Actuales</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {productTypes.map((type) => (
              <div key={type.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {type.displayName}
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {type.name}
                      </span>
                      {type.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactivo
                        </span>
                      )}
                    </div>
                    {type.description && (
                      <p className="text-gray-600 mt-2">{type.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(type)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de que quieres eliminar el tipo "${type.displayName}"?`)) {
                          toast.error('Eliminación no implementada aún');
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {productTypes.length === 0 && (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No hay tipos de producto
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Empieza creando tu primer tipo de producto.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear Primer Tipo
                </button>
              </div>
            </div>
          )}
        </div>

        <Toaster position="top-right" />
      </div>
    </AdminLayout>
  );
}
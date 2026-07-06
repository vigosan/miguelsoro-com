import { useState } from "react";
import type { ReactElement } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "react-hot-toast";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog, Confirmation } from "@/components/ui/ConfirmDialog";
import {
  ProductType,
  useProductTypes,
  useCreateProductType,
  useUpdateProductType,
  useDeleteProductType,
} from "@/hooks/useProductTypesAdmin";

export default function ProductTypesAdmin() {
  const { data: productTypes = [], isLoading: loading } = useProductTypes();
  const createMutation = useCreateProductType();
  const updateMutation = useUpdateProductType();
  const deleteMutation = useDeleteProductType();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    description: "",
  });
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.displayName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (submitting) return;

    try {
      if (editingType) {
        await updateMutation.mutateAsync({
          id: editingType.id,
          data: formData,
        });
        toast.success("Tipo de producto actualizado correctamente");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Tipo de producto creado correctamente");
      }

      setEditingType(null);
      setFormData({ displayName: "", description: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error saving product type:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar el tipo de producto",
      );
    }
  };

  const handleEdit = (productType: ProductType) => {
    setEditingType(productType);
    setFormData({
      displayName: productType.displayName,
      description: productType.description || "",
    });
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingType(null);
    setFormData({ displayName: "", description: "" });
    setShowCreateForm(false);
  };

  const handleDelete = async (productType: ProductType) => {
    try {
      await deleteMutation.mutateAsync(productType.id);
      toast.success("Tipo de producto eliminado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el tipo",
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Tipos de Producto"
          description="Gestiona las categorías de productos (Cuadros, Reproducciones, Camisetas, etc.)"
        />
        <ListSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Tipos de Producto"
          description="Gestiona las categorías de productos (Cuadros, Reproducciones, Camisetas, etc.)"
          action={
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto cursor-pointer"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Tipo
            </button>
          }
        />

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              {editingType
                ? "Editar Tipo de Producto"
                : "Crear Nuevo Tipo de Producto"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Nombre del Tipo *"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="Ej: Reproducciones de Alta Calidad"
                  required
                />
                {!editingType && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                    Se generará automáticamente un nombre interno:{" "}
                    {formData.displayName
                      ? formData.displayName.toLowerCase().replace(/\s+/g, "-")
                      : ""}
                  </p>
                )}
              </div>

              <Textarea
                label="Descripción"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Descripción del tipo de producto..."
              />

              <div className="flex flex-col space-y-3 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors order-2 sm:order-1 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors order-1 sm:order-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Guardando…"
                    : `${editingType ? "Actualizar" : "Crear"} Tipo`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product Types List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Tipos de Producto Actuales
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {productTypes.map((type) => (
              <div
                key={type.id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {type.displayName}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ID: {type.name}
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
                    </div>
                    {type.description && (
                      <p className="text-sm sm:text-base text-gray-600 mt-2 break-words">
                        {type.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(type)}
                      className="p-2 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmation({
                          title: "Eliminar tipo de producto",
                          description: `Se eliminará el tipo "${type.displayName}". Esta acción no se puede deshacer.`,
                          confirmLabel: "Eliminar",
                          action: () => handleDelete(type),
                        })
                      }
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Eliminar"
                      aria-label={`Eliminar "${type.displayName}"`}
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
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
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-900 cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear Primer Tipo
                </button>
              </div>
            </div>
          )}
        </div>

        <ConfirmDialog
          confirmation={confirmation}
          onClose={() => setConfirmation(null)}
        />
      </div>
    </>
  );
}

ProductTypesAdmin.getLayout = (page: ReactElement) => (
  <AdminLayout title="Tipos de Producto - Admin">{page}</AdminLayout>
);

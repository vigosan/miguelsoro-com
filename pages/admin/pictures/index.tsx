import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import Image from "next/image";
import { useAdminPictures } from "@/hooks/useAdminPictures";
import { formatCurrency } from "@/utils/formatCurrency";
import { Toaster, toast } from "react-hot-toast";
import { 
  PlusIcon,
  PencilIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";

const statusColors = {
  AVAILABLE: "bg-green-100 text-green-800",
  SOLD: "bg-gray-100 text-gray-800", 
  RESERVED: "bg-yellow-100 text-yellow-800",
};

const statusLabels = {
  AVAILABLE: "Disponible",
  SOLD: "Vendido",
  RESERVED: "Reservado",
};

export default function AdminPictures() {
  const { pictures, loading, error, deletePicture } = useAdminPictures();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${title}"?`)) {
      try {
        await deletePicture(id);
        toast.success('Cuadro eliminado correctamente');
      } catch (err) {
        toast.error('Error al eliminar el cuadro');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Cuadros - Admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Cuadros - Admin">
        <div className="text-center text-red-600 py-8">
          Error: {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Cuadros - Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cuadros</h1>
            <p className="mt-2 text-gray-600">
              Gestiona todos los cuadros de la galería
            </p>
          </div>
          <Link
            href="/admin/pictures/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Añadir Cuadro
          </Link>
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <select className="rounded-md border-gray-300 text-sm">
            <option>Todos los estados</option>
            <option>Disponible</option>
            <option>Vendido</option>
            <option>Reservado</option>
          </select>
          <input
            type="search"
            placeholder="Buscar cuadros..."
            className="flex-1 max-w-md rounded-md border-gray-300 text-sm"
          />
        </div>

        {/* Pictures Grid */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 gap-6 p-6">
            {pictures.map((picture) => (
              <div
                key={picture.id}
                className="flex items-center space-x-6 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Image */}
                <div className="flex-shrink-0">
                  <Image
                    src={picture.imageUrl || `/pictures/${picture.id}.webp`}
                    alt={picture.title}
                    width={120}
                    height={90}
                    className="rounded-lg object-cover border"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {picture.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {picture.size}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {picture.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                      {/* Status */}
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        statusColors[picture.status]
                      )}>
                        {statusLabels[picture.status]}
                      </span>
                      
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(picture.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/pictures/${picture.slug}`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Ver en el sitio"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/pictures/${picture.id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {pictures.length === 0 && (
            <div className="text-center py-12">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No hay cuadros
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Empieza añadiendo tu primer cuadro.
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/pictures/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Añadir Cuadro
                </Link>
              </div>
            </div>
          )}
        </div>
        <Toaster position="top-right" />
      </div>
    </AdminLayout>
  );
}
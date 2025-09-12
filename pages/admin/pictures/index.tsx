import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import Image from "next/image";
import { usePictures, useDeletePicture, PictureStatus } from "@/hooks/usePictures";
import { formatCurrency } from "@/utils/formatCurrency";
import { Toaster, toast } from "react-hot-toast";
import { 
  PlusIcon,
  PencilIcon,
  EyeIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Build filters for React Query
  const filters = {
    ...(statusFilter !== 'ALL' && { status: statusFilter as PictureStatus }),
    ...(searchQuery && { search: searchQuery })
  };

  const { data: pictures = [], isLoading: loading, error } = usePictures(filters);
  const deletePictureMutation = useDeletePicture();

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${title}"?`)) {
      try {
        await deletePictureMutation.mutateAsync(id);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Cuadros - Admin">
        <div className="text-center text-red-600 py-8">
          Error: {error.message}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Cuadros - Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cuadros</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Gestiona todos los cuadros de la galería
            </p>
          </div>
          <Link
            href="/admin/pictures/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto cursor-pointer"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Añadir Cuadro
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="ALL">Todos los estados</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="SOLD">Vendido</option>
            <option value="RESERVED">Reservado</option>
          </Select>
          <Input
            type="search"
            placeholder="Buscar cuadros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 sm:max-w-md"
          />
        </div>

        {/* Pictures Grid */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 p-4 sm:p-6">
            {pictures.map((picture) => (
              <div
                key={picture.id}
                className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:space-y-0 lg:space-x-6 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Image */}
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  <Image
                    src={picture.imageUrl || `/pictures/${picture.id}.webp`}
                    alt={picture.title}
                    width={120}
                    height={90}
                    className="w-20 h-15 sm:w-24 sm:h-18 lg:w-30 lg:h-auto rounded-lg object-cover border"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Title and basic info */}
                  <div className="text-center lg:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {picture.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {picture.size}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">
                      {picture.description}
                    </p>
                  </div>
                  
                  {/* Status, Stock, Price - Mobile stacked, Desktop inline */}
                  <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                    {/* Status & Stock */}
                    <div className="flex flex-col items-center lg:items-start space-y-2">
                      <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2">
                        <span className={cn(
                          "inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium",
                          statusColors[picture.status]
                        )}>
                          {statusLabels[picture.status]}
                        </span>
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Stock: {picture.stock || 0}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {picture.productTypeName || 'Sin tipo'}
                      </p>
                    </div>
                    
                    {/* Price */}
                    <div className="text-center lg:text-right">
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        {formatCurrency(picture.price)}
                      </p>
                    </div>
                  </div>

                  {/* Actions - Always at bottom on mobile, right side on desktop */}
                  <div className="flex items-center justify-center lg:justify-end space-x-3 pt-2 border-t border-gray-100 lg:border-t-0 lg:pt-0">
                    <Link
                      href={`/pictures/${picture.slug}`}
                      className="flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                      title="Ver en el sitio"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Ver</span>
                    </Link>
                    <Link
                      href={`/admin/pictures/${picture.id}/edit`}
                      className="flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Editar</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pictures.length === 0 && !loading && (
            <div className="text-center py-12">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {(statusFilter !== 'ALL' || searchQuery) ? 'No se encontraron cuadros' : 'No hay cuadros'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {(statusFilter !== 'ALL' || searchQuery) ? 'Intenta cambiar los filtros de búsqueda.' : 'Empieza añadiendo tu primer cuadro.'}
              </p>
              {!(statusFilter !== 'ALL' || searchQuery) && (
                <div className="mt-6">
                  <Link
                    href="/admin/pictures/new"
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 cursor-pointer"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Añadir Cuadro
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        <Toaster position="top-right" />
      </div>
    </AdminLayout>
  );
}
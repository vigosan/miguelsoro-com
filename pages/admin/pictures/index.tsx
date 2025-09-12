import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import Image from "next/image";
import { usePictures, useDeletePicture } from "@/hooks/usePictures";
import { PictureStatus, getPictureStatus } from "@/domain/picture";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatEuros } from "@/domain/order";
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
  NOT_AVAILABLE: "bg-gray-100 text-gray-800", 
};

const statusLabels = {
  AVAILABLE: "Disponible",
  NOT_AVAILABLE: "No disponible",
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

        {/* Pictures Grid - Minimalist Design */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 gap-1 divide-y divide-gray-100">
            {pictures.map((picture) => (
              <div
                key={picture.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                {/* Left side - Image and basic info */}
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={picture.imageUrl || `/pictures/${picture.id}.webp`}
                      alt={picture.title}
                      width={64}
                      height={48}
                      className="w-16 h-12 rounded-md object-cover border"
                    />
                  </div>

                  {/* Title and size */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {picture.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {picture.size}
                    </p>
                  </div>
                </div>

                {/* Center - Status */}
                <div className="hidden md:flex items-center min-w-0">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                    statusColors[getPictureStatus(picture)]
                  )}>
                    {statusLabels[getPictureStatus(picture)]}
                  </span>
                </div>

                {/* Mobile - Status below title */}
                <div className="md:hidden">
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      statusColors[getPictureStatus(picture)]
                    )}>
                      {statusLabels[getPictureStatus(picture)]}
                    </span>
                    <span className="text-xs text-gray-500">
                      Stock: {picture.stock || 0}
                    </span>
                  </div>
                </div>

                {/* Right side - Stock, Price and Actions */}
                <div className="flex items-center space-x-6">
                  <div className="hidden md:block text-xs text-gray-500 whitespace-nowrap">
                    Stock: {picture.stock || 0}
                  </div>
                  
                  <div className="text-right min-w-0">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatEuros(picture.price)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Link
                      href={`/pictures/${picture.slug}`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Ver en el sitio"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/pictures/${picture.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
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
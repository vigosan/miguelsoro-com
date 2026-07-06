import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import Image from "next/image";
import { usePictures, useDeletePicture } from "@/hooks/usePictures";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PictureStatus, getPictureStatus } from "@/domain/picture";
import { formatEuros } from "@/domain/order";
import { Toaster, toast } from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  EyeIcon,
  PhotoIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PageHeader } from "@/components/admin/PageHeader";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog, Confirmation } from "@/components/ui/ConfirmDialog";

const statusColors = {
  AVAILABLE: "bg-green-100 text-green-800",
  NOT_AVAILABLE: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  AVAILABLE: "Disponible",
  NOT_AVAILABLE: "No disponible",
};

const PAGE_SIZE = 20;

export default function AdminPictures() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Reset to first page whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const filters = {
    ...(statusFilter !== "ALL" && { status: statusFilter as PictureStatus }),
    ...(debouncedSearch && { search: debouncedSearch }),
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading: loading, error } = usePictures(filters);
  const pictures = data?.pictures ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const deletePictureMutation = useDeletePicture();

  const handleDelete = async (id: string) => {
    try {
      await deletePictureMutation.mutateAsync(id);
      toast.success("Cuadro eliminado correctamente");
    } catch (err) {
      toast.error("Error al eliminar el cuadro");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cuadros"
          description="Gestiona todos los cuadros de la galería"
        />
        <ListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="text-center text-red-600 py-8">
          Error: {error.message}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Cuadros"
          description="Gestiona todos los cuadros de la galería"
          action={
            <Link
              href="/admin/pictures/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto cursor-pointer"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Añadir Cuadro
            </Link>
          }
        />

        {/* Filters */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="ALL">Todos los estados</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="NOT_AVAILABLE">No disponible</option>
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
            {pictures.map((picture) => {
              const status = getPictureStatus(picture);
              return (
              <div
                key={picture.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-3 sm:gap-0"
              >
                {/* Left side - Image and info */}
                <div className="flex items-start space-x-4 min-w-0 flex-1">
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

                  {/* Title, size, status, stock, price */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {picture.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>{picture.size}</span>
                      <span>·</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatEuros(picture.price)}
                      </span>
                      <span>·</span>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          statusColors[status],
                        )}
                      >
                        {statusLabels[status]}
                      </span>
                      <span>·</span>
                      <span>Stock: {picture.stock || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Actions only */}
                <div className="flex items-center space-x-1 flex-shrink-0 self-start sm:self-center">
                  <Link
                    href={`/pictures/${picture.slug}`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                    title="Ver en el sitio"
                    aria-label={`Ver "${picture.title}" en el sitio`}
                  >
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href={`/admin/pictures/${picture.id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                    title="Editar"
                    aria-label={`Editar "${picture.title}"`}
                  >
                    <PencilIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmation({
                        title: "Eliminar cuadro",
                        description: `Se eliminará "${picture.title}". Esta acción no se puede deshacer.`,
                        confirmLabel: "Eliminar",
                        action: () => handleDelete(picture.id),
                      })
                    }
                    disabled={deletePictureMutation.isPending}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Eliminar"
                    aria-label={`Eliminar "${picture.title}"`}
                  >
                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          {pictures.length === 0 && !loading && (
            <div className="text-center py-12">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {statusFilter !== "ALL" || searchQuery
                  ? "No se encontraron cuadros"
                  : "No hay cuadros"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter !== "ALL" || searchQuery
                  ? "Intenta cambiar los filtros de búsqueda."
                  : "Empieza añadiendo tu primer cuadro."}
              </p>
              {!(statusFilter !== "ALL" || searchQuery) && (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {page} de {totalPages} · {total} cuadros
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <Toaster position="top-right" />
      </div>
      <ConfirmDialog
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
      />
    </>
  );
}

AdminPictures.getLayout = (page: ReactElement) => (
  <AdminLayout title="Cuadros - Admin">{page}</AdminLayout>
);

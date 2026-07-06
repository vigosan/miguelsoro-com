import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "react-hot-toast";
import { usePicture, useUpdatePicture } from "@/hooks/usePictures";
import { ArrowLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog, Confirmation } from "@/components/ui/ConfirmDialog";
import {
  PictureForm,
  PictureFormValues,
} from "@/components/admin/PictureForm";

export default function EditPicture() {
  const router = useRouter();
  const { id } = router.query;
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const {
    data: picture,
    isLoading: loading,
    error,
  } = usePicture(typeof id === "string" ? id : "");
  const updatePictureMutation = useUpdatePicture();

  const handleSubmit = async (values: PictureFormValues) => {
    if (!picture) return;

    try {
      await updatePictureMutation.mutateAsync({
        id: picture.id,
        data: {
          ...values,
          price: parseFloat(values.price),
          stock: values.stock === "" ? 0 : parseInt(values.stock),
        },
      });

      toast.success("Cuadro actualizado correctamente");
      router.push("/admin/pictures");
    } catch (error) {
      console.error("Error updating picture:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el cuadro",
      );
    }
  };

  const handleDelete = async () => {
    if (!picture) return;

    try {
      const response = await fetch(`/api/admin/pictures/${picture.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar el cuadro");
      }

      toast.success("Cuadro eliminado correctamente");
      router.push("/admin/pictures");
    } catch (error) {
      console.error("Error deleting picture:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el cuadro",
      );
    }
  };

  useEffect(() => {
    if (error) {
      toast.error("Error al cargar el cuadro");
      router.push("/admin/pictures");
    }
  }, [error, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!picture) {
    return (
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
    );
  }

  return (
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
          <h1 className="text-3xl font-bold text-gray-900">Editar Cuadro</h1>
        </div>
        <button
          onClick={() =>
            setConfirmation({
              title: "Eliminar cuadro",
              description: `Se eliminará "${picture.title}". Esta acción no se puede deshacer.`,
              confirmLabel: "Eliminar",
              action: handleDelete,
            })
          }
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors cursor-pointer"
        >
          Eliminar Cuadro
        </button>
      </div>

      <PictureForm
        initialValues={{
          title: picture.title || "",
          description: picture.description || "",
          price: picture.price?.toString() || "0",
          size: picture.size || "",
          slug: picture.slug || "",
          productTypeId: picture.productTypeId || "",
          stock: picture.stock?.toString() || "1",
          imageUrl: picture.imageUrl || "",
        }}
        submitting={updatePictureMutation.isPending}
        submitLabel="Guardar Cambios"
        submittingLabel="Guardando..."
        onSubmit={handleSubmit}
        previewExtra={
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
                  {new Date(picture.createdAt).toLocaleDateString("es-ES")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Actualizado:</span>
                <span className="text-gray-900">
                  {new Date(picture.updatedAt).toLocaleDateString("es-ES")}
                </span>
              </div>
            </div>
          </div>
        }
      />

      <ConfirmDialog
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
      />
    </div>
  );
}

EditPicture.getLayout = (page: ReactElement) => (
  <AdminLayout title="Editar Cuadro - Admin">{page}</AdminLayout>
);

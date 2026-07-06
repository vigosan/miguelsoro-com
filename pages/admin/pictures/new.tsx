import { useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import {
  PictureForm,
  PictureFormValues,
} from "@/components/admin/PictureForm";

export default function NewPicture() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values: PictureFormValues) => {
    if (!values.imageUrl) {
      toast.error("Por favor sube una imagen para el cuadro");
      return;
    }

    if (!values.productTypeId) {
      toast.error("Por favor selecciona un tipo de producto");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/pictures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          price: parseFloat(values.price), // Send price in euros, repository will handle conversion
          stock: parseInt(values.stock) || 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el cuadro");
      }

      toast.success("Cuadro creado correctamente");
      router.push("/admin/pictures");
    } catch (error) {
      console.error("Error creating picture:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear el cuadro",
      );
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">
            Añadir Nuevo Cuadro
          </h1>
        </div>
      </div>

      <PictureForm
        initialValues={{
          title: "",
          description: "",
          price: "",
          size: "",
          slug: "",
          productTypeId: "",
          stock: "1",
          imageUrl: "",
        }}
        autoSlugFromTitle
        submitting={saving}
        submitLabel="Crear Cuadro"
        submittingLabel="Creando..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}

NewPicture.getLayout = (page: ReactElement) => (
  <AdminLayout title="Añadir Cuadro - Admin">{page}</AdminLayout>
);

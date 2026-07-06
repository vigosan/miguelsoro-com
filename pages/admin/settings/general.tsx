import { useState } from "react";
import type { ReactElement } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  GeneralSettingsForm,
  useGeneralSettings,
  useSaveGeneralSettings,
} from "@/hooks/useAdminSettings";

function SettingsForm({ initial }: { initial: GeneralSettingsForm }) {
  const [settings, setSettings] = useState<GeneralSettingsForm>(initial);
  const saveMutation = useSaveGeneralSettings();

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(settings);
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar la configuración",
      );
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">
          Configuración General
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <Input
            label="Nombre del sitio *"
            type="text"
            value={settings.siteName}
            onChange={(e) =>
              setSettings({ ...settings, siteName: e.target.value })
            }
          />
          <Textarea
            label="Descripción del sitio *"
            value={settings.siteDescription}
            onChange={(e) =>
              setSettings({ ...settings, siteDescription: e.target.value })
            }
            rows={3}
          />
          <Input
            label="Email de contacto *"
            type="email"
            value={settings.contactEmail}
            onChange={(e) =>
              setSettings({ ...settings, contactEmail: e.target.value })
            }
          />
        </div>

        <h3 className="text-base sm:text-lg font-medium text-gray-900 mt-6 sm:mt-8 mb-2">
          Datos fiscales
        </h3>
        <p className="text-sm text-gray-600 mb-4 sm:mb-6">
          Aparecen en las facturas enviadas a los clientes. Sin ellos no se
          pueden emitir facturas.
        </p>
        <div className="space-y-4 sm:space-y-6">
          <Input
            label="Nombre o razón social"
            type="text"
            value={settings.businessName}
            onChange={(e) =>
              setSettings({ ...settings, businessName: e.target.value })
            }
          />
          <Input
            label="NIF"
            type="text"
            value={settings.businessNif}
            onChange={(e) =>
              setSettings({ ...settings, businessNif: e.target.value })
            }
          />
          <Textarea
            label="Dirección fiscal"
            value={settings.businessAddress}
            onChange={(e) =>
              setSettings({ ...settings, businessAddress: e.target.value })
            }
            rows={2}
          />
        </div>
      </div>

      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {saveMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function GeneralSettings() {
  // The form only mounts once the stored settings arrive: rendering editable
  // defaults first invited saving them over the real fiscal data.
  const { data: settings, isLoading, isError } = useGeneralSettings();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-sm text-red-700">
          No se pudo cargar la configuración. Recarga la página.
        </p>
      </div>
    );
  }

  return <SettingsForm initial={settings} />;
}

GeneralSettings.getLayout = (page: ReactElement) => (
  <AdminLayout title="Configuración General - Admin">
    <SettingsLayout>{page}</SettingsLayout>
  </AdminLayout>
);

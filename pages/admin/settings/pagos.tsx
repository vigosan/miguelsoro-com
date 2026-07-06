import { useState } from "react";
import type { ReactElement } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ShippingSettingsForm,
  useShippingSettings,
  useSaveShippingSettings,
} from "@/hooks/useAdminSettings";

function SettingsForm({ initial }: { initial: ShippingSettingsForm }) {
  const [settings, setSettings] = useState<ShippingSettingsForm>(initial);
  const saveMutation = useSaveShippingSettings();

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(settings);
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error al guardar la configuración");
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">
          Configuración de Pagos
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </p>
              <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                Euro (€)
              </p>
            </div>
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">
                IVA
              </p>
              <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                21 %
              </p>
            </div>
          </div>
          <p className="-mt-2 text-xs text-gray-500">
            Moneda e IVA son fijos del sistema. Contacta con soporte para
            cambiarlos.
          </p>
          <div>
            <Input
              label="Coste de envío (€)"
              type="number"
              min="0"
              step="0.01"
              value={settings.shippingCost}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  shippingCost: parseFloat(e.target.value) || 0,
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Coste del envío estándar
            </p>
          </div>
          <div>
            <Input
              label="Umbral para envío gratuito (€)"
              type="number"
              min="0"
              step="0.01"
              value={settings.freeShippingThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  freeShippingThreshold: parseFloat(e.target.value) || 0,
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Pedidos superiores a esta cantidad tendrán envío gratuito. 0 para
              desactivar envío gratuito.
            </p>
          </div>
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

export default function PaymentSettings() {
  const { data: settings, isLoading, isError } = useShippingSettings();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
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

PaymentSettings.getLayout = (page: ReactElement) => (
  <AdminLayout title="Configuración de Pagos - Admin">
    <SettingsLayout>{page}</SettingsLayout>
  </AdminLayout>
);

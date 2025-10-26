import { useState } from "react";
import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { Toaster, toast } from "react-hot-toast";
import { Toggle } from "@/components/ui/Toggle";

type StoreSettings = {
  allowGuestCheckout: boolean;
  maintenanceMode: boolean;
};

const defaultSettings: StoreSettings = {
  allowGuestCheckout: true,
  maintenanceMode: false,
};

export default function StoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout title="Configuración de Tienda - Admin">
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">
          Configuración de Tienda
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <Toggle
            label="Permitir compras sin registro"
            checked={settings.allowGuestCheckout}
            onChange={(e) =>
              setSettings({ ...settings, allowGuestCheckout: e.target.checked })
            }
          />
          <Toggle
            label="Modo mantenimiento"
            description="El sitio mostrará una página de mantenimiento para visitantes"
            checked={settings.maintenanceMode}
            onChange={(e) =>
              setSettings({ ...settings, maintenanceMode: e.target.checked })
            }
          />
        </div>
      </div>

      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      <Toaster position="top-right" />
    </SettingsLayout>
  );
}

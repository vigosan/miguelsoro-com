import { useState } from "react";
import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { Toaster, toast } from "react-hot-toast";
import { Toggle } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";

type InventorySettings = {
  enableInventoryTracking: boolean;
  lowStockThreshold: number;
};

const defaultSettings: InventorySettings = {
  enableInventoryTracking: true,
  lowStockThreshold: 1,
};

export default function InventorySettings() {
  const [settings, setSettings] = useState<InventorySettings>(defaultSettings);
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
    <SettingsLayout title="Configuración de Inventario - Admin">
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">
          Configuración de Inventario
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <Toggle
            label="Habilitar seguimiento de inventario"
            checked={settings.enableInventoryTracking}
            onChange={(e) =>
              setSettings({
                ...settings,
                enableInventoryTracking: e.target.checked,
              })
            }
          />
          {settings.enableInventoryTracking && (
            <div>
              <Input
                label="Umbral de stock bajo"
                type="number"
                min="0"
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    lowStockThreshold: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Notificar cuando el stock esté por debajo de este número
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      <Toaster position="top-right" />
    </SettingsLayout>
  );
}

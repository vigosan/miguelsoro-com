import { useState } from "react";
import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { Toaster, toast } from "react-hot-toast";
import { Toggle } from "@/components/ui/Toggle";

type AdminSettings = {
  adminNotifications: boolean;
};

const defaultSettings: AdminSettings = {
  adminNotifications: true,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
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
    <SettingsLayout title="Configuración de Admin - Admin">
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">
          Configuración de Administrador
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <Toggle
            label="Recibir notificaciones por email"
            description="Nuevos pedidos, stock bajo, etc."
            checked={settings.adminNotifications}
            onChange={(e) =>
              setSettings({ ...settings, adminNotifications: e.target.checked })
            }
          />
          <div className="pt-4 border-t">
            <h4 className="text-md font-medium text-gray-900 mb-2">
              Información del Sistema
            </h4>
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p>
                <strong>Versión:</strong> 1.0.0
              </p>
              <p>
                <strong>Base de datos:</strong> Supabase PostgreSQL
              </p>
              <p>
                <strong>Almacenamiento:</strong> Vercel Blob
              </p>
              <p>
                <strong>Pagos:</strong> Stripe (Configurado)
              </p>
            </div>
          </div>
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

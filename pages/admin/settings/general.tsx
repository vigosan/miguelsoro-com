import { useState, useEffect } from "react";
import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { Toaster, toast } from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type GeneralSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  businessName: string;
  businessNif: string;
  businessAddress: string;
};

const defaultSettings: GeneralSettings = {
  siteName: "Miguel Soro - Arte Ciclista",
  siteDescription:
    "Obras de arte originales inspiradas en el mundo del ciclismo",
  contactEmail: "info@miguelsoro.com",
  businessName: "",
  businessNif: "",
  businessAddress: "",
};

export default function GeneralSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/general-settings");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            siteName: data.siteName ?? defaultSettings.siteName,
            siteDescription:
              data.siteDescription ?? defaultSettings.siteDescription,
            contactEmail: data.contactEmail ?? defaultSettings.contactEmail,
            businessName: data.businessName ?? "",
            businessNif: data.businessNif ?? "",
            businessAddress: data.businessAddress ?? "",
          });
        }
      } catch (error) {
        console.error("Error loading general settings:", error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/general-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save settings");
      }

      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar la configuración",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsLayout title="Configuración General - Admin">
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

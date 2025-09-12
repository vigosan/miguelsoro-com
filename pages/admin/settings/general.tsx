import { useState } from "react";
import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { Toaster, toast } from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type GeneralSettings = {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
};

const defaultSettings: GeneralSettings = {
  siteName: "Miguel Soro - Arte Ciclista",
  siteDescription: "Obras de arte originales inspiradas en el mundo del ciclismo",
  contactEmail: "info@miguelsoro.com",
};

export default function GeneralSettings() {
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
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
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          />
          <Textarea
            label="Descripción del sitio *"
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            rows={3}
          />
          <Input
            label="Email de contacto *"
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
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
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
      
      <Toaster position="top-right" />
    </SettingsLayout>
  );
}
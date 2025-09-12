import { useState } from "react";
import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { Toaster, toast } from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type PaymentSettings = {
  currency: string;
  taxRate: number;
  shippingCost: number;
};

const defaultSettings: PaymentSettings = {
  currency: "EUR",
  taxRate: 21,
  shippingCost: 0,
};

export default function PaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
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
    <SettingsLayout title="Configuración de Pagos - Admin">
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">
          Configuración de Pagos
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <Select
            label="Moneda"
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
          >
            <option value="EUR">Euro (€)</option>
            <option value="USD">Dólar ($)</option>
            <option value="GBP">Libra (£)</option>
          </Select>
          <Input
            label="IVA (%)"
            type="number"
            min="0"
            max="50"
            step="0.01"
            value={settings.taxRate}
            onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
          />
          <div>
            <Input
              label="Coste de envío (€)"
              type="number"
              min="0"
              step="0.01"
              value={settings.shippingCost}
              onChange={(e) => setSettings({ ...settings, shippingCost: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-gray-500 mt-1">
              0 para envío gratuito
            </p>
          </div>
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
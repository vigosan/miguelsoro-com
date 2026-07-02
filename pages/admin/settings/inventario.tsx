import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { Toggle } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";

export default function InventorySettings() {
  return (
    <SettingsLayout title="Configuración de Inventario - Admin">
      <div className="p-4 sm:p-6">
        <div className="mb-6 flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Configuración de Inventario
          </h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Próximamente
          </span>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          El stock se gestiona por obra desde la ficha de cada cuadro. Estas
          opciones globales aún no están disponibles.
        </p>
        <div className="space-y-4 sm:space-y-6 opacity-50 pointer-events-none">
          <Toggle
            label="Habilitar seguimiento de inventario"
            checked
            disabled
            onChange={() => {}}
          />
          <div>
            <Input
              label="Umbral de stock bajo"
              type="number"
              min="0"
              value={1}
              disabled
              onChange={() => {}}
            />
            <p className="text-xs text-gray-500 mt-1">
              Notificar cuando el stock esté por debajo de este número
            </p>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}

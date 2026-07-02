import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { Toggle } from "@/components/ui/Toggle";

export default function StoreSettings() {
  return (
    <SettingsLayout title="Configuración de Tienda - Admin">
      <div className="p-4 sm:p-6">
        <div className="mb-6 flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Configuración de Tienda
          </h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Próximamente
          </span>
        </div>
        <p className="mb-6 text-sm text-gray-500">
          Estas opciones aún no están disponibles. Se habilitarán en una próxima
          versión.
        </p>
        <div className="space-y-4 sm:space-y-6 opacity-50 pointer-events-none">
          <Toggle
            label="Permitir compras sin registro"
            checked
            disabled
            onChange={() => {}}
          />
          <Toggle
            label="Modo mantenimiento"
            description="El sitio mostrará una página de mantenimiento para visitantes"
            checked={false}
            disabled
            onChange={() => {}}
          />
        </div>
      </div>
    </SettingsLayout>
  );
}

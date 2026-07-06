import type { ReactElement } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsLayout } from "@/components/admin/SettingsLayout";
import { Toggle } from "@/components/ui/Toggle";

export default function AdminSettings() {
  return (
    <>
      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">
          Configuración de Administrador
        </h3>
        <div className="space-y-4 sm:space-y-6">
          <div className="opacity-50 pointer-events-none">
            <Toggle
              label="Recibir notificaciones por email"
              description="Próximamente"
              checked
              disabled
              onChange={() => {}}
            />
          </div>
          <p className="text-xs text-gray-500">
            Las notificaciones de nuevos pedidos se envían al email de contacto
            configurado en la pestaña General.
          </p>
          <div className="pt-4 border-t">
            <h4 className="text-md font-medium text-gray-900 mb-2">
              Información del Sistema
            </h4>
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <p>
                <strong>Base de datos:</strong> Supabase PostgreSQL
              </p>
              <p>
                <strong>Almacenamiento:</strong> Vercel Blob
              </p>
              <p>
                <strong>Pagos:</strong> PayPal
              </p>
              <p>
                <strong>Email:</strong> Resend
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

AdminSettings.getLayout = (page: ReactElement) => (
  <AdminLayout title="Configuración de Admin - Admin">
    <SettingsLayout>{page}</SettingsLayout>
  </AdminLayout>
);

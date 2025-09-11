import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import { 
  PhotoIcon, 
  ShoppingBagIcon,
  CurrencyEuroIcon,
  EyeIcon
} from "@heroicons/react/24/outline";

const stats = [
  {
    name: "Total Cuadros",
    value: "24",
    icon: PhotoIcon,
    href: "/admin/pictures",
    color: "bg-blue-500"
  },
  {
    name: "Cuadros Disponibles", 
    value: "18",
    icon: EyeIcon,
    href: "/admin/pictures?status=available",
    color: "bg-green-500"
  },
  {
    name: "Cuadros Vendidos",
    value: "6", 
    icon: ShoppingBagIcon,
    href: "/admin/pictures?status=sold",
    color: "bg-gray-500"
  },
  {
    name: "Ingresos Totales",
    value: "€12.450",
    icon: CurrencyEuroIcon,
    href: "/admin/orders",
    color: "bg-yellow-500"
  },
];

const recentActivity = [
  {
    id: 1,
    type: "sale",
    message: "Vendido: Abraham Olano - Equipo ONCE",
    time: "Hace 2 horas",
  },
  {
    id: 2,
    type: "inquiry",
    message: "Nueva consulta sobre Vintage Style",
    time: "Hace 5 horas",
  },
  {
    id: 3,
    type: "update",
    message: "Actualizado precio de Ercole Baldini",
    time: "Hace 1 día",
  },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Resumen de la galería Miguel Soro
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="group relative overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h2>
            <div className="space-y-3">
              <Link
                href="/admin/pictures/new"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <PhotoIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Añadir Nuevo Cuadro
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
              <Link
                href="/admin/pictures"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <EyeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Ver Todos los Cuadros
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <ShoppingBagIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Gestionar Pedidos
                  </span>
                </div>
                <span className="text-gray-400">→</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Actividad Reciente
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3"
                >
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
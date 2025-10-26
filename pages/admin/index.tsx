import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import {
  PhotoIcon,
  ShoppingBagIcon,
  CurrencyEuroIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { usePictureStats } from "@/hooks/usePictures";
import { useOrderStats } from "@/hooks/useOrders";

const recentActivity: any[] = [];

export default function AdminDashboard() {
  const { data: pictureStats, isLoading: pictureStatsLoading } =
    usePictureStats();
  const { data: orderStats, isLoading: orderStatsLoading } = useOrderStats();

  const loading = pictureStatsLoading || orderStatsLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount / 100);
  };

  const dashboardStats = [
    {
      name: "Total Cuadros",
      value: loading ? "..." : (pictureStats?.totalPictures || 0).toString(),
      icon: PhotoIcon,
      href: "/admin/pictures",
      color: "bg-gray-900",
    },
    {
      name: "Cuadros Disponibles",
      value: loading
        ? "..."
        : (pictureStats?.availablePictures || 0).toString(),
      icon: EyeIcon,
      href: "/admin/pictures?status=available",
      color: "bg-green-500",
    },
    {
      name: "No Disponibles",
      value: loading
        ? "..."
        : (pictureStats?.notAvailablePictures || 0).toString(),
      icon: ShoppingBagIcon,
      href: "/admin/pictures?status=not-available",
      color: "bg-gray-500",
    },
    {
      name: "Ingresos Totales",
      value: loading ? "..." : formatCurrency(orderStats?.totalRevenue || 0),
      icon: CurrencyEuroIcon,
      href: "/admin/orders",
      color: "bg-yellow-500",
    },
  ];
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Resumen de la galería Miguel Soro
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.href}
              className="group relative overflow-hidden rounded-lg bg-white p-4 sm:p-6 shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.color}`}>
                  <stat.icon
                    className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-900 truncate">
                    {stat.name}
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="rounded-lg bg-white p-4 sm:p-6 shadow">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Acciones Rápidas
            </h2>
            <div className="space-y-2 sm:space-y-3">
              <Link
                href="/admin/pictures/new"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center min-w-0">
                  <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    Añadir Nuevo Cuadro
                  </span>
                </div>
                <span className="text-gray-400 ml-2">→</span>
              </Link>
              <Link
                href="/admin/pictures"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center min-w-0">
                  <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    Ver Todos los Cuadros
                  </span>
                </div>
                <span className="text-gray-400 ml-2">→</span>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center min-w-0">
                  <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    Gestionar Pedidos
                  </span>
                </div>
                <span className="text-gray-400 ml-2">→</span>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg bg-white p-4 sm:p-6 shadow">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Actividad Reciente
            </h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-gray-900 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    No hay actividad reciente
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Los eventos aparecerán aquí cuando ocurran
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

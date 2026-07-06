import type { ReactElement } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import Link from "next/link";
import {
  PhotoIcon,
  ShoppingBagIcon,
  CurrencyEuroIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { usePictureStats } from "@/hooks/usePictures";
import { useOrderStats, useOrders } from "@/hooks/useOrders";
import { PageHeader } from "@/components/admin/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";

type StatCardData = {
  name: string;
  value: string | null;
  icon: typeof PhotoIcon;
  href: string;
  color: string;
};

function StatCard({ stat }: { stat: StatCardData }) {
  return (
    <Link
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
        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-gray-900 truncate">
            {stat.name}
          </p>
          {stat.value === null ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              {stat.value}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

const orderStatusStyles: Record<string, { label: string; classes: string }> = {
  PENDING: { label: "Pendiente", classes: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Pagado", classes: "bg-green-100 text-green-800" },
  PROCESSING: { label: "Procesando", classes: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "Enviado", classes: "bg-blue-100 text-blue-800" },
  DELIVERED: { label: "Entregado", classes: "bg-purple-100 text-purple-800" },
  CANCELLED: { label: "Cancelado", classes: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Reembolsado", classes: "bg-red-100 text-red-800" },
};

export default function AdminDashboard() {
  const { data: pictureStats, isLoading: pictureStatsLoading } =
    usePictureStats();
  const { data: orderStats, isLoading: orderStatsLoading } = useOrderStats();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  const loading = pictureStatsLoading || orderStatsLoading;
  const recentOrders = (orders || []).slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount / 100);
  };

  const salesStats = [
    {
      name: "Ingresos Totales",
      value: loading ? null : formatCurrency(orderStats?.totalRevenue || 0),
      icon: CurrencyEuroIcon,
      href: "/admin/orders",
      color: "bg-yellow-500",
    },
    {
      name: "Pedidos Totales",
      value: loading ? null : (orderStats?.totalOrders || 0).toString(),
      icon: ShoppingBagIcon,
      href: "/admin/orders",
      color: "bg-gray-900",
    },
    {
      name: "Pendientes de Enviar",
      value: loading ? null : (orderStats?.pendingOrders || 0).toString(),
      icon: ClockIcon,
      href: "/admin/orders",
      color: "bg-amber-600",
    },
    {
      name: "Entregados",
      value: loading ? null : (orderStats?.completedOrders || 0).toString(),
      icon: CheckCircleIcon,
      href: "/admin/orders",
      color: "bg-green-500",
    },
  ];

  const catalogStats = [
    {
      name: "Total Cuadros",
      value: loading ? null : (pictureStats?.totalPictures || 0).toString(),
      icon: PhotoIcon,
      href: "/admin/pictures",
      color: "bg-gray-900",
    },
    {
      name: "Cuadros Disponibles",
      value: loading
        ? null
        : (pictureStats?.availablePictures || 0).toString(),
      icon: EyeIcon,
      href: "/admin/pictures?status=available",
      color: "bg-green-500",
    },
    {
      name: "No Disponibles",
      value: loading
        ? null
        : (pictureStats?.notAvailablePictures || 0).toString(),
      icon: ShoppingBagIcon,
      href: "/admin/pictures?status=not-available",
      color: "bg-gray-500",
    },
  ];
  return (
    <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Resumen de la galería Miguel Soro"
        />

        {/* Sales stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {salesStats.map((stat) => (
            <StatCard key={stat.name} stat={stat} />
          ))}
        </div>

        {/* Recent orders */}
        <div className="rounded-lg bg-white shadow">
          <div className="flex items-center justify-between p-4 sm:p-6 pb-0 sm:pb-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Últimos Pedidos
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Ver todos →
            </Link>
          </div>
          <div className="p-4 sm:p-6">
            {ordersLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay pedidos.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const status = orderStatusStyles[order.status] ?? {
                    label: order.status,
                    classes: "bg-gray-100 text-gray-800",
                  };
                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between gap-3 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            "es-ES",
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.classes}`}
                        >
                          {status.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Catalog stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalogStats.map((stat) => (
            <StatCard key={stat.name} stat={stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
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
        </div>
    </div>
  );
}

AdminDashboard.getLayout = (page: ReactElement) => (
  <AdminLayout>{page}</AdminLayout>
);

import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { isAuthenticated } from "../../../lib/auth";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import {
  formatPrice,
  orderReference,
  orderStatusMeta,
} from "../../../domain/order";
import Link from "next/link";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { PageHeader } from "../../../components/admin/PageHeader";
import { ListSkeleton } from "../../../components/ui/Skeleton";
import {
  useOrders,
  useOrderStats,
  OrderStatus,
} from "../../../hooks/useOrders";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

const PAGE_SIZE = 20;

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const { data, isLoading, isError } = useOrders({
    status: filter !== "all" ? (filter as OrderStatus) : undefined,
    search: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const { data: stats } = useOrderStats();

  // Reset to first page when filters change.
  useEffect(() => {
    setPage(1);
  }, [filter, debouncedSearch]);

  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? 1;

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pedidos"
          description="Gestiona todos los pedidos de la tienda"
        />
        <div
          className="rounded-md border border-red-200 bg-red-50 p-6"
          data-testid="orders-load-error"
        >
          <h3 className="text-sm font-semibold text-red-800">
            No se pudieron cargar los pedidos
          </h3>
          <p className="mt-1 text-sm text-red-700">
            Ha fallado la consulta a la base de datos. Los pedidos siguen ahí:
            revisa los logs del servidor y recarga la página.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pedidos"
          description="Gestiona todos los pedidos de la tienda"
        />
        <ListSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Pedidos"
          description="Gestiona todos los pedidos de la tienda"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalOrders ?? 0}
            </div>
            <div className="text-sm text-gray-500">Total pedidos</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats?.statusCounts?.PAID ?? 0}
            </div>
            <div className="text-sm text-gray-500">Pagados</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.statusCounts?.PENDING ?? 0}
            </div>
            <div className="text-sm text-gray-500">Pendientes</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.statusCounts?.PROCESSING ?? 0}
            </div>
            <div className="text-sm text-gray-500">Procesando</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-48"
            data-testid="orders-filter"
          >
            <option value="all">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="PAID">Pagado</option>
            <option value="PROCESSING">Procesando</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregado</option>
            <option value="CANCELLED">Cancelado</option>
            <option value="REFUNDED">Reembolsado</option>
          </Select>
          <Input
            type="search"
            placeholder="Buscar pedidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 sm:max-w-md"
            data-testid="orders-search"
          />
        </div>

        {/* Orders Grid - Minimalist Design */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 gap-1 divide-y divide-gray-100">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-3 sm:gap-0"
                data-testid={`order-row-${order.id}`}
              >
                {/* Left side - Order info and customer */}
                <div className="flex items-start space-x-4 min-w-0 flex-1">
                  {/* Order info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {orderReference(order)} - {order.customerName}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>{order.customerEmail}</span>
                      <span>·</span>
                      <span>{order.items.length} productos</span>
                      <span>·</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <span>·</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${orderStatusMeta(order.status).badgeClasses}`}
                      >
                        {orderStatusMeta(order.status).label}
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Actions only */}
                <div className="flex items-center space-x-1 flex-shrink-0 self-start sm:self-center">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                    title="Ver detalles"
                    data-testid={`view-order-${order.id}`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {filter !== "all" || searchTerm
                  ? "No se encontraron pedidos"
                  : "No hay pedidos"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter !== "all" || searchTerm
                  ? "Intenta cambiar los filtros de búsqueda."
                  : "Los pedidos aparecerán aquí cuando se realicen."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages} · {total} pedidos
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

AdminOrdersPage.getLayout = (page: ReactElement) => (
  <AdminLayout title="Gestión de Pedidos">{page}</AdminLayout>
);

// Auth-only: order data now loads client-side through React Query.
export const getServerSideProps: GetServerSideProps = async (context) => {
  const authenticated = await isAuthenticated(context.req);

  if (!authenticated) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

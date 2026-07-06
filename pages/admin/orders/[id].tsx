import { useState, useEffect } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { AdminLayout } from "../../../components/admin/AdminLayout";
import { OrderWithDetails } from "../../../infra/OrderRepository";
import { formatInvoiceNumber } from "../../../domain/order";
import { Skeleton } from "../../../components/ui/Skeleton";
import { PageHeader } from "../../../components/admin/PageHeader";

const STATUS_FLOW = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

interface OrderDetailsProps {
  order: OrderWithDetails | null;
  loading: boolean;
  error: string | null;
}

function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);

  const handleSendInvoice = async () => {
    if (!order) return;
    const confirmed = window.confirm(
      `¿Enviar la factura por email a ${order.customerEmail}?`,
    );
    if (!confirmed) return;

    setSendingInvoice(true);
    try {
      const response = await fetch(
        `/api/admin/orders/${order.id}/send-invoice`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar la factura");
      }
      toast.success(`Factura ${data.invoiceNumber} enviada a ${data.sentTo}`);
      const refreshed = await fetch(`/api/admin/orders/${order.id}`);
      if (refreshed.ok) {
        const refreshedData = await refreshed.json();
        setOrder(refreshedData.order);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al enviar la factura",
      );
    } finally {
      setSendingInvoice(false);
    }
  };

  const handleRefund = async () => {
    if (!order) return;
    const confirmed = window.confirm(
      `¿Reembolsar ${(order.total / 100).toFixed(2)} € al cliente vía PayPal? Esta acción no se puede deshacer.`,
    );
    if (!confirmed) return;

    setRefunding(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo reembolsar");
      }
      setOrder((prev) => (prev ? { ...prev, status: "REFUNDED" } : prev));
      toast.success("Reembolso completado correctamente");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al reembolsar");
    } finally {
      setRefunding(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar el estado");
      }
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      if (data.warning) {
        toast.error(data.warning, { duration: 8000 });
      } else {
        toast.success("Estado actualizado");
      }
      if (newStatus === "SHIPPED") {
        const refreshed = await fetch(`/api/admin/orders/${order.id}`);
        if (refreshed.ok) {
          const refreshedData = await refreshed.json();
          setOrder(refreshedData.order);
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error al actualizar el estado",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/orders/${id}`);

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Volver
          </button>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Pedido no encontrado
          </h3>
          <p className="text-yellow-700">
            No se pudo encontrar el pedido con ID: {id}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
          >
            Volver
          </button>
        </div>
      </>
    );
  }

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== "number") return "€0.00";
    return (amount / 100).toFixed(2) + "€";
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "Fecha no disponible";
    return new Date(date).toLocaleString("es-ES");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Pagado";
      case "PENDING":
        return "Pendiente";
      case "PROCESSING":
        return "Procesando";
      case "SHIPPED":
        return "Enviado";
      case "DELIVERED":
        return "Entregado";
      case "CANCELLED":
        return "Cancelado";
      case "REFUNDED":
        return "Reembolsado";
      default:
        return status;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title={`Pedido #${order.id ? order.id.slice(-8).toUpperCase() : "N/A"}`}
          description={`Creado el ${formatDate(order.createdAt)}`}
          action={
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto cursor-pointer"
            >
              ← Volver
            </button>
          }
        />

        {/* Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Estado del Pedido
              </h2>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
              >
                {getStatusText(order.status)}
              </span>
            </div>
            {order.status === "PAID" && (
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="refund-button"
              >
                {refunding ? "Reembolsando…" : "Reembolsar pedido"}
              </button>
            )}
          </div>

          {(() => {
            const currentIndex = STATUS_FLOW.indexOf(order.status as never);
            const nextStatus =
              currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1
                ? STATUS_FLOW[currentIndex + 1]
                : null;
            const canCancel = ["PENDING", "PAID", "PROCESSING"].includes(
              order.status,
            );
            if (!nextStatus && !canCancel) return null;
            return (
              <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                {nextStatus && (
                  <button
                    onClick={() => handleStatusChange(nextStatus)}
                    disabled={updatingStatus}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="advance-status-button"
                  >
                    {updatingStatus
                      ? "Actualizando…"
                      : `Marcar como ${getStatusText(nextStatus)}`}
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Cancelar este pedido? El cliente no será reembolsado automáticamente.",
                        )
                      ) {
                        handleStatusChange("CANCELLED");
                      }
                    }}
                    disabled={updatingStatus}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar pedido
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* Invoice */}
        {(["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
          order.status,
        ) ||
          order.invoiceNumber) && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-1">Factura</h2>
            <p className="text-sm text-gray-600 mb-4">
              {order.invoiceNumber
                ? `Factura ${formatInvoiceNumber(order.invoiceNumber)} emitida el ${formatDate(order.invoicedAt!)}`
                : "Se adjunta automáticamente al email al marcar el pedido como Enviado. Al emitirla se le asigna el siguiente número correlativo."}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`/api/admin/orders/${order.id}/invoice`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                data-testid="view-invoice-button"
              >
                Ver factura
              </a>
              <button
                onClick={handleSendInvoice}
                disabled={sendingInvoice}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="send-invoice-button"
              >
                {sendingInvoice
                  ? "Enviando…"
                  : "Enviar factura al cliente"}
              </button>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Información del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {order.customerName || "No disponible"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {order.customerEmail || "No disponible"}
              </p>
            </div>
            {order.customerPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {order.customerPhone}
                </p>
              </div>
            )}
            {order.shippingAddress && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dirección de Envío
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {order.shippingAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Productos</h2>
          <div className="space-y-4">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  {item.variant?.product?.images &&
                    item.variant.product.images.length > 0 && (
                      <Image
                        src={item.variant.product.images[0].url}
                        alt={item.variant.product.title}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.variant?.product?.title || "Producto"}
                    </h3>
                    {item.variant?.product?.productType && (
                      <p className="text-sm text-gray-600">
                        {item.variant.product.productType.displayName}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        Cantidad: {item.quantity}
                      </span>
                      <span className="text-sm text-gray-600">
                        Precio unitario: {formatCurrency(item.price)}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg font-medium">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay productos en este pedido</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Resumen del Pedido
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Impuestos:</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío:</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-medium text-lg">
              <span>Total:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {order.paypalOrderId && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Información del Pago
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID de Transacción PayPal
              </label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {order.paypalOrderId}
              </p>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </>
  );
}

OrderDetails.getLayout = (page: ReactElement) => (
  <AdminLayout>{page}</AdminLayout>
);

export default OrderDetails;

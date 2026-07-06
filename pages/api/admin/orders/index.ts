import type { NextApiRequest, NextApiResponse } from "next";
import { getAllOrders } from "../../../../infra/dependencies";
import { requireAuth } from "@/lib/auth";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value: unknown, fallback: number, max: number) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), max);
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      let orders = await getAllOrders.execute();

      const status = firstParam(req.query.status);
      if (status) {
        orders = orders.filter((order) => order.status === status);
      }

      const search = firstParam(req.query.search)?.trim().toLowerCase();
      if (search) {
        orders = orders.filter(
          (order) =>
            order.customerName.toLowerCase().includes(search) ||
            order.customerEmail.toLowerCase().includes(search) ||
            order.id.toLowerCase().includes(search) ||
            (order.orderNumber ?? "").toLowerCase().includes(search),
        );
      }

      const total = orders.length;

      // Pagination is opt-in: only when a `page` param is present.
      if (req.query.page !== undefined) {
        const limit = parsePositiveInt(
          req.query.limit,
          DEFAULT_PAGE_SIZE,
          MAX_PAGE_SIZE,
        );
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const page = Math.min(
          parsePositiveInt(req.query.page, 1, totalPages),
          totalPages,
        );
        const start = (page - 1) * limit;
        const paged = orders.slice(start, start + limit);

        return res
          .status(200)
          .json({ orders: paged, total, page, totalPages, limit });
      }

      return res.status(200).json({ orders, total });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default requireAuth(handler);

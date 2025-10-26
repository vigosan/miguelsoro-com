import type { NextApiRequest, NextApiResponse } from "next";
import { getAllOrders } from "../../../../infra/dependencies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      const orders = await getAllOrders.execute();
      return res.status(200).json({ orders });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return res.status(500).json({ error: "Failed to fetch orders" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

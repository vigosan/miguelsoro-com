import type { NextApiRequest, NextApiResponse } from "next";
import {
  DatabaseProductTypeRepository,
  DatabaseProductRepository,
} from "@/infra/DatabaseProductRepository";
import { requireAuth } from "@/lib/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid product type id" });
  }

  if (req.method === "PUT") {
    try {
      const { displayName, description } = req.body;

      if (!displayName || !displayName.trim()) {
        return res.status(400).json({ error: "displayName is required" });
      }

      const productTypeRepository = new DatabaseProductTypeRepository();

      const existing = await productTypeRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: "Product type not found" });
      }

      const productType = await productTypeRepository.update(id, {
        displayName,
        description,
      });

      return res.status(200).json({ productType });
    } catch (error) {
      console.error("Error updating product type:", error);
      return res.status(500).json({ error: "Failed to update product type" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const productTypeRepository = new DatabaseProductTypeRepository();

      const existing = await productTypeRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: "Product type not found" });
      }

      // Integrity check: refuse to delete a type still used by products.
      const productRepository = new DatabaseProductRepository();
      const products = await productRepository.findByProductType(id);
      if (products.length > 0) {
        return res.status(409).json({
          error: `No se puede eliminar: hay ${products.length} obra${
            products.length === 1 ? "" : "s"
          } usando este tipo.`,
          count: products.length,
        });
      }

      await productTypeRepository.delete(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting product type:", error);
      return res.status(500).json({ error: "Failed to delete product type" });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
};

export default requireAuth(handler);

import type { NextApiRequest, NextApiResponse } from "next";
import { DatabaseProductTypeRepository } from "@/infra/DatabaseProductRepository";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      const productTypeRepository = new DatabaseProductTypeRepository();
      const productTypes = await productTypeRepository.findAll();

      return res.status(200).json({ productTypes });
    } catch (error) {
      console.error("Error fetching product types:", error);
      return res.status(500).json({ error: "Failed to fetch product types" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, displayName, description } = req.body;

      if (!name || !displayName) {
        return res
          .status(400)
          .json({ error: "Name and displayName are required" });
      }

      const productTypeRepository = new DatabaseProductTypeRepository();
      const productType = await productTypeRepository.create({
        name: name.toLowerCase().replace(/\s+/g, "-"),
        displayName,
        description,
        isActive: true,
      });

      return res.status(201).json({ productType });
    } catch (error) {
      console.error("Error creating product type:", error);
      return res.status(500).json({ error: "Failed to create product type" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

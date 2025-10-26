import type { NextApiRequest, NextApiResponse } from "next";
import { DatabasePictureRepository } from "@/infra/DatabasePictureRepository";
import { requireAuth } from "@/lib/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const pictureRepository = new DatabasePictureRepository();
      const pictures = await pictureRepository.findAll();

      return res.status(200).json({ pictures });
    } catch (error) {
      console.error("Error fetching pictures:", error);
      return res.status(500).json({ error: "Failed to fetch pictures" });
    }
  }

  if (req.method === "POST") {
    try {
      // For now, creating products is not implemented through the admin API
      // This would require more complex logic for product types, variants, etc.
      return res
        .status(501)
        .json({ error: "Creating products not yet implemented" });
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default requireAuth(handler);

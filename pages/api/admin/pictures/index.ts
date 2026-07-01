import type { NextApiRequest, NextApiResponse } from "next";
import { DatabasePictureRepository } from "@/infra/DatabasePictureRepository";
import { getPictureStatus, PictureStatus } from "@/domain/picture";
import { requireAuth } from "@/lib/auth";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value: unknown, fallback: number, max: number) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), max);
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const pictureRepository = new DatabasePictureRepository();
      let pictures = await pictureRepository.findAll();

      // Status filter (only real domain statuses).
      const status = req.query.status;
      if (status === "AVAILABLE" || status === "NOT_AVAILABLE") {
        pictures = pictures.filter(
          (p) => getPictureStatus(p) === (status as PictureStatus),
        );
      }

      // Search by title (case-insensitive).
      const rawSearch = Array.isArray(req.query.search)
        ? req.query.search[0]
        : req.query.search;
      const search = rawSearch?.trim().toLowerCase();
      if (search) {
        pictures = pictures.filter((p) =>
          p.title.toLowerCase().includes(search),
        );
      }

      const total = pictures.length;

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
        const paged = pictures.slice(start, start + limit);

        return res
          .status(200)
          .json({ pictures: paged, total, page, totalPages, limit });
      }

      return res.status(200).json({ pictures, total });
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

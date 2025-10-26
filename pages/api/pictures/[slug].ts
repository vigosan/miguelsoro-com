import type { NextApiRequest, NextApiResponse } from "next";
import { DatabasePictureRepository } from "@/infra/DatabasePictureRepository";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Invalid slug parameter" });
  }

  try {
    const pictureRepository = new DatabasePictureRepository();
    const picture = await pictureRepository.getPictureBySlug(slug);

    if (!picture) {
      return res.status(404).json({ error: "Picture not found" });
    }

    return res.status(200).json(picture);
  } catch (error) {
    console.error("Error fetching public picture:", error);
    return res.status(500).json({ error: "Failed to fetch picture" });
  }
};

export default handler;

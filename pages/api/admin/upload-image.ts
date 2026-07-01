import { NextApiRequest, NextApiResponse } from "next";
import { put } from "@vercel/blob";
import { requireAuth } from "@/lib/auth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filename, file } = req.body ?? {};

    if (typeof filename !== "string" || typeof file !== "string") {
      return res.status(400).json({ error: "Filename and file are required" });
    }

    // Sanitize filename: keep only the base name, safe characters.
    const safeName = filename
      .replace(/^.*[\\/]/, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .slice(0, 100);
    if (!safeName || safeName === "." || safeName === "..") {
      return res.status(400).json({ error: "Invalid filename" });
    }

    // Validate and decode the data URI.
    const match = /^data:(image\/(jpeg|png|webp));base64,(.+)$/.exec(file);
    if (!match) {
      return res
        .status(400)
        .json({ error: "Invalid image data (expected base64 image data URI)" });
    }
    const contentType = match[1];
    const buffer = Buffer.from(match[3], "base64");

    const blob = await put(`pictures/${safeName}`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });

    return res.status(200).json({
      url: blob.url,
      downloadUrl: blob.downloadUrl,
    });
  } catch (error) {
    console.error("Error uploading to Blob:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
};

export default requireAuth(handler);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

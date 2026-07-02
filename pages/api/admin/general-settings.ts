import type { NextApiRequest, NextApiResponse } from "next";
import {
  getGeneralSettings,
  saveGeneralSettings,
} from "@/services/databaseGeneralSettings";
import { requireAuth } from "@/lib/auth";

const DEFAULTS = {
  siteName: "Miguel Soro - Arte Ciclista",
  siteDescription:
    "Obras de arte originales inspiradas en el mundo del ciclismo",
  contactEmail: "info@miguelsoro.com",
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const settings = await getGeneralSettings();
      if (!settings) {
        return res.status(200).json(DEFAULTS);
      }
      return res.status(200).json({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        contactEmail: settings.contactEmail,
      });
    } catch (error) {
      console.error("Error fetching general settings:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if (req.method === "POST") {
    try {
      const { siteName, siteDescription, contactEmail } = req.body ?? {};

      if (typeof siteName !== "string" || !siteName.trim()) {
        return res
          .status(400)
          .json({ error: "El nombre del sitio es obligatorio" });
      }
      if (typeof contactEmail !== "string" || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
        return res
          .status(400)
          .json({ error: "El email de contacto no es válido" });
      }

      const settings = await saveGeneralSettings({
        siteName: siteName.trim(),
        siteDescription:
          typeof siteDescription === "string" ? siteDescription : "",
        contactEmail: contactEmail.trim(),
      });

      return res.status(200).json({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        contactEmail: settings.contactEmail,
      });
    } catch (error) {
      console.error("Error saving general settings:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
};

export default requireAuth(handler);

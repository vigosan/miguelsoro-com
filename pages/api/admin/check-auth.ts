import { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (isAuthenticated(req)) {
    return res.status(200).json({ authenticated: true });
  } else {
    return res.status(401).json({ error: "Not authenticated" });
  }
}

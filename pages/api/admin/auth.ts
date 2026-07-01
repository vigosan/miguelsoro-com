import { NextApiRequest, NextApiResponse } from "next";
import {
  createSessionToken,
  sessionCookie,
  clearSessionCookie,
} from "@/lib/auth";

// Basic in-memory rate limiting per IP (best-effort; resets on redeploy).
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    if (isRateLimited(ip)) {
      return res
        .status(429)
        .json({ error: "Demasiados intentos. Inténtalo más tarde." });
    }

    const { password } = req.body ?? {};
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(500).json({ error: "Admin password not configured" });
    }

    if (typeof password !== "string" || password !== adminPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = await createSessionToken();
    res.setHeader("Set-Cookie", [sessionCookie(token)]);
    return res
      .status(200)
      .json({ success: true, message: "Authenticated successfully" });
  } else if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", [clearSessionCookie()]);
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } else {
    res.setHeader("Allow", ["POST", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}

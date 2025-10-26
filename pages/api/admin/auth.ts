import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(500).json({ error: "Admin password not configured" });
    }

    if (password === adminPassword) {
      // Set a simple session cookie (in production, use proper JWT or encrypted session)
      res.setHeader("Set-Cookie", [
        `admin-session=authenticated; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
      ]);

      return res
        .status(200)
        .json({ success: true, message: "Authenticated successfully" });
    } else {
      return res.status(401).json({ error: "Invalid password" });
    }
  } else if (req.method === "DELETE") {
    // Logout - clear the session cookie
    res.setHeader("Set-Cookie", [
      `admin-session=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
    ]);
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } else {
    res.setHeader("Allow", ["POST", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}

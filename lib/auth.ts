import { NextApiRequest, NextApiResponse } from "next";
import { GetServerSidePropsContext } from "next";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin-session";
const MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Max-Age=${MAX_AGE_SECONDS}; SameSite=Strict${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict${secure}`;
}

function readTokenFromCookies(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return match.slice(COOKIE_NAME.length + 1) || null;
}

export async function isAuthenticated(
  req: NextApiRequest | GetServerSidePropsContext["req"],
): Promise<boolean> {
  const token = readTokenFromCookies(req.headers.cookie);
  if (!token) return false;

  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function requireAuth(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
  ) => Promise<void | unknown> | void | unknown,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!(await isAuthenticated(req))) {
      return res.status(401).json({ error: "Authentication required" });
    }
    return handler(req, res);
  };
}

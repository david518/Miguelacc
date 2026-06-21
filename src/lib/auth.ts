import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_token";
const EXPIRY_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRY_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { email: payload.email as string };
  } catch {
    return null;
  }
}

export function verifyCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  const emailMatch =
    email.length === adminEmail.length &&
    timingSafeEqual(Buffer.from(email), Buffer.from(adminEmail));
  const passwordMatch =
    password.length === adminPassword.length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));

  return emailMatch && passwordMatch;
}

export { COOKIE_NAME, EXPIRY_SECONDS };

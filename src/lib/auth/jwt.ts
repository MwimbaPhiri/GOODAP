import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-only-insecure-secret-change-me-in-production-0123456789"
);

const ISSUER = "mediapulse-ai";
const AUDIENCE = "mediapulse-ai";

export interface AccessTokenClaims {
  sub: string; // user id
  email: string;
  name?: string;
}

export async function signAccessToken(claims: AccessTokenClaims, expiresIn = "7d"): Promise<string> {
  return new SignJWT({ email: claims.email, name: claims.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { issuer: ISSUER, audience: AUDIENCE });
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      name: payload.name ? String(payload.name) : undefined,
    };
  } catch {
    return null;
  }
}

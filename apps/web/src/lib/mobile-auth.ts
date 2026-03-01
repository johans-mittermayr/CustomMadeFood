import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-for-dev"
);

export async function createMobileToken(payload: {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId: string | null;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyMobileToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as {
      id: string;
      email: string;
      name: string;
      role: string;
      restaurantId: string | null;
    };
  } catch {
    return null;
  }
}

import { auth } from "./auth";
import { verifyMobileToken } from "./mobile-auth";

interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId: string | null;
}

export async function getApiUser(req: Request): Promise<ApiUser | null> {
  // Try NextAuth session first (web)
  const session = await auth();
  if (session?.user) {
    const user = session.user as any;
    return {
      id: user.id,
      email: user.email!,
      name: user.name!,
      role: user.role,
      restaurantId: user.restaurantId,
    };
  }

  // Try Bearer token (mobile)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return verifyMobileToken(token);
  }

  return null;
}

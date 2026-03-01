import type { UserRole } from "@custom-made-food/shared";

declare module "next-auth" {
  interface User {
    role: UserRole;
    restaurantId: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      restaurantId: string | null;
    };
  }
}

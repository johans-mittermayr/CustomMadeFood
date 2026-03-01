import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@custom-made-food/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const role = url.searchParams.get("role");

  let query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      restaurantId: users.restaurantId,
      createdAt: users.createdAt,
    })
    .from(users);

  if (role) {
    const result = await query.where(eq(users.role, role as any));
    return NextResponse.json(result);
  }

  const result = await query;
  return NextResponse.json(result);
}

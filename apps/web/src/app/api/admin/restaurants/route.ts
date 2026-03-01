import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurants, users } from "@custom-made-food/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.select().from(restaurants);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, address, phone, ownerId } = await req.json();

  if (!name || !ownerId) {
    return NextResponse.json(
      { error: "Name and owner are required" },
      { status: 400 }
    );
  }

  const [result] = await db
    .insert(restaurants)
    .values({ name, description, address, phone, ownerId })
    .returning();

  // Link owner to restaurant
  await db
    .update(users)
    .set({ restaurantId: result.id })
    .where(eq(users.id, ownerId));

  return NextResponse.json(result);
}

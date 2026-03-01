import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderStatusHistory } from "@custom-made-food/db";
import { getApiUser } from "@/lib/api-auth";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  const [result] = await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  await db.insert(orderStatusHistory).values({
    orderId: id,
    status,
    changedBy: user.id,
  });

  return NextResponse.json(result);
}

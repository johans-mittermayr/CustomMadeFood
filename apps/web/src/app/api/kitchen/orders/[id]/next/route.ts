import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusHistory } from "@custom-made-food/db";
import { getApiUser } from "@/lib/api-auth";
import { eq } from "drizzle-orm";
import { count } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Get current order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Count total items
  const [{ count: totalItems }] = await db
    .select({ count: count() })
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  const nextIndex = order.currentItemIndex + 1;

  if (nextIndex >= totalItems) {
    // All items weighed — mark as ready
    const [result] = await db
      .update(orders)
      .set({
        currentItemIndex: nextIndex,
        status: "ready",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    await db.insert(orderStatusHistory).values({
      orderId: id,
      status: "ready",
      changedBy: user.id,
    });

    return NextResponse.json(result);
  } else {
    // Move to next item
    const [result] = await db
      .update(orders)
      .set({
        currentItemIndex: nextIndex,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    return NextResponse.json(result);
  }
}

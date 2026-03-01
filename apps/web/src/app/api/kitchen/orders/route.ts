import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, ingredients } from "@custom-made-food/db";
import { getApiUser } from "@/lib/api-auth";
import { eq, and, inArray, asc } from "drizzle-orm";

export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.restaurantId) {
    return NextResponse.json({ error: "No restaurant assigned" }, { status: 403 });
  }

  // Get active orders (accepted, preparing, weighing)
  const activeOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, user.restaurantId),
        inArray(orders.status, ["accepted", "preparing", "weighing"])
      )
    )
    .orderBy(asc(orders.createdAt));

  // Also get pending orders
  const pendingOrders = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, user.restaurantId),
        eq(orders.status, "pending")
      )
    )
    .orderBy(asc(orders.createdAt));

  const allOrders = [...pendingOrders, ...activeOrders];

  const result = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db
        .select({
          id: orderItems.id,
          ingredientId: orderItems.ingredientId,
          quantityGrams: orderItems.quantityGrams,
          price: orderItems.price,
          sortOrder: orderItems.sortOrder,
          ingredientName: ingredients.name,
          ingredientCategory: ingredients.category,
        })
        .from(orderItems)
        .innerJoin(ingredients, eq(orderItems.ingredientId, ingredients.id))
        .where(eq(orderItems.orderId, order.id))
        .orderBy(asc(orderItems.sortOrder));

      return { ...order, items };
    })
  );

  return NextResponse.json(result);
}

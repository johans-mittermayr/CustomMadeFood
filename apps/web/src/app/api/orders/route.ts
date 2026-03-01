import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  orderStatusHistory,
  ingredients,
} from "@custom-made-food/db";
import { auth } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const url = new URL(req.url);
  const restaurantId = url.searchParams.get("restaurantId");
  const status = url.searchParams.get("status");

  let whereConditions = [];

  if (user.role === "customer") {
    whereConditions.push(eq(orders.customerId, user.id));
  } else if (user.role === "restaurant_owner" || user.role === "kitchen_staff") {
    if (user.restaurantId) {
      whereConditions.push(eq(orders.restaurantId, user.restaurantId));
    }
  } else if (user.role === "admin" && restaurantId) {
    whereConditions.push(eq(orders.restaurantId, restaurantId));
  }

  if (status) {
    whereConditions.push(eq(orders.status, status as any));
  }

  const condition =
    whereConditions.length > 1
      ? and(...whereConditions)
      : whereConditions[0] || undefined;

  const orderList = await db
    .select()
    .from(orders)
    .where(condition)
    .orderBy(desc(orders.createdAt));

  // Fetch items for each order
  const result = await Promise.all(
    orderList.map(async (order) => {
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
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    })
  );

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const { restaurantId, items, notes } = await req.json();

  if (!restaurantId || !items || items.length === 0) {
    return NextResponse.json(
      { error: "Restaurant and items are required" },
      { status: 400 }
    );
  }

  // Calculate total price
  let totalPrice = 0;
  const itemsWithPrice = await Promise.all(
    items.map(
      async (
        item: { ingredientId: string; quantityGrams: number },
        index: number
      ) => {
        const [ingredient] = await db
          .select()
          .from(ingredients)
          .where(eq(ingredients.id, item.ingredientId))
          .limit(1);

        const price =
          Number(ingredient.pricePerGram) * item.quantityGrams;
        totalPrice += price;

        return {
          ingredientId: item.ingredientId,
          quantityGrams: item.quantityGrams,
          price: price.toFixed(2),
          sortOrder: index,
        };
      }
    )
  );

  const [order] = await db
    .insert(orders)
    .values({
      customerId: user.id,
      restaurantId,
      totalPrice: totalPrice.toFixed(2),
      notes,
      status: "pending",
    })
    .returning();

  await db.insert(orderItems).values(
    itemsWithPrice.map((item: any) => ({
      ...item,
      orderId: order.id,
    }))
  );

  await db.insert(orderStatusHistory).values({
    orderId: order.id,
    status: "pending",
    changedBy: user.id,
  });

  return NextResponse.json(order);
}

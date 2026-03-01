import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ingredients, ingredientMacros, macroTypes } from "@custom-made-food/db";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const restaurantId = url.searchParams.get("restaurantId");

  if (!restaurantId) {
    return NextResponse.json(
      { error: "restaurantId is required" },
      { status: 400 }
    );
  }

  const ingredientList = await db
    .select()
    .from(ingredients)
    .where(eq(ingredients.restaurantId, restaurantId));

  // Fetch macros for each ingredient
  const result = await Promise.all(
    ingredientList.map(async (ingredient) => {
      const macros = await db
        .select({
          id: ingredientMacros.id,
          macroTypeId: ingredientMacros.macroTypeId,
          valuePer100g: ingredientMacros.valuePer100g,
          macroName: macroTypes.name,
          macroUnit: macroTypes.unit,
        })
        .from(ingredientMacros)
        .innerJoin(macroTypes, eq(ingredientMacros.macroTypeId, macroTypes.id))
        .where(eq(ingredientMacros.ingredientId, ingredient.id));

      return { ...ingredient, macros };
    })
  );

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  if (!["restaurant_owner", "admin"].includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, description, category, pricePerGram, minGrams, maxGrams, restaurantId, macros } =
    await req.json();

  if (!name || !pricePerGram || !restaurantId) {
    return NextResponse.json(
      { error: "Name, pricePerGram, and restaurantId are required" },
      { status: 400 }
    );
  }

  const [ingredient] = await db
    .insert(ingredients)
    .values({
      name,
      description,
      category,
      pricePerGram,
      minGrams: minGrams || 10,
      maxGrams: maxGrams || 500,
      restaurantId,
    })
    .returning();

  // Insert macros if provided
  if (macros && Array.isArray(macros) && macros.length > 0) {
    await db.insert(ingredientMacros).values(
      macros.map((m: { macroTypeId: string; valuePer100g: string }) => ({
        ingredientId: ingredient.id,
        macroTypeId: m.macroTypeId,
        valuePer100g: m.valuePer100g,
      }))
    );
  }

  return NextResponse.json(ingredient);
}

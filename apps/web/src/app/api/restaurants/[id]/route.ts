import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurants, ingredients, ingredientMacros, macroTypes } from "@custom-made-food/db";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, id))
    .limit(1);

  if (!restaurant) {
    return NextResponse.json(
      { error: "Restaurant not found" },
      { status: 404 }
    );
  }

  const ingredientList = await db
    .select()
    .from(ingredients)
    .where(
      and(
        eq(ingredients.restaurantId, id),
        eq(ingredients.isAvailable, true)
      )
    );

  const ingredientsWithMacros = await Promise.all(
    ingredientList.map(async (ingredient) => {
      const macros = await db
        .select({
          macroTypeId: ingredientMacros.macroTypeId,
          valuePer100g: ingredientMacros.valuePer100g,
          name: macroTypes.name,
          unit: macroTypes.unit,
        })
        .from(ingredientMacros)
        .innerJoin(macroTypes, eq(ingredientMacros.macroTypeId, macroTypes.id))
        .where(eq(ingredientMacros.ingredientId, ingredient.id));

      return { ...ingredient, macros };
    })
  );

  return NextResponse.json({
    ...restaurant,
    ingredients: ingredientsWithMacros,
  });
}

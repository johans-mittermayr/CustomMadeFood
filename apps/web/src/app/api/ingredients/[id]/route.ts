import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ingredients, ingredientMacros } from "@custom-made-food/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { macros, ...ingredientData } = await req.json();

  const [result] = await db
    .update(ingredients)
    .set({ ...ingredientData, updatedAt: new Date() })
    .where(eq(ingredients.id, id))
    .returning();

  // Update macros: delete old and insert new
  if (macros && Array.isArray(macros)) {
    await db
      .delete(ingredientMacros)
      .where(eq(ingredientMacros.ingredientId, id));

    if (macros.length > 0) {
      await db.insert(ingredientMacros).values(
        macros.map((m: { macroTypeId: string; valuePer100g: string }) => ({
          ingredientId: id,
          macroTypeId: m.macroTypeId,
          valuePer100g: m.valuePer100g,
        }))
      );
    }
  }

  return NextResponse.json(result);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db.delete(ingredients).where(eq(ingredients.id, id));

  return NextResponse.json({ success: true });
}

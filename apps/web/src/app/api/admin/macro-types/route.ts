import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { macroTypes } from "@custom-made-food/db";
import { auth } from "@/lib/auth";
import { asc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db
    .select()
    .from(macroTypes)
    .orderBy(asc(macroTypes.displayOrder));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, unit, displayOrder } = await req.json();

  if (!name || !unit) {
    return NextResponse.json(
      { error: "Name and unit are required" },
      { status: 400 }
    );
  }

  const [result] = await db
    .insert(macroTypes)
    .values({ name, unit, displayOrder: displayOrder || 0 })
    .returning();

  return NextResponse.json(result);
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { macroTypes } from "@custom-made-food/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const [result] = await db
    .update(macroTypes)
    .set(body)
    .where(eq(macroTypes.id, id))
    .returning();

  return NextResponse.json(result);
}

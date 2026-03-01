import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurants } from "@custom-made-food/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const result = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.isActive, true));

  return NextResponse.json(result);
}

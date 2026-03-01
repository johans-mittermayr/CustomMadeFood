import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@custom-made-food/db";
import { createMobileToken } from "@/lib/mobile-auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  const isValid = await compare(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  }

  if (user.role !== "kitchen_staff" && user.role !== "restaurant_owner") {
    return NextResponse.json(
      { error: "Acesso restrito à equipe da cozinha" },
      { status: 403 }
    );
  }

  const token = await createMobileToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
  });

  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    },
  });
}

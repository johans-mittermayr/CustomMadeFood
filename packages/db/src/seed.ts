import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

async function hashPassword(password: string): Promise<string> {
  const { hash } = await import("bcryptjs");
  return hash(password, 12);
}

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  console.log("Limpando banco de dados...");

  // Clear tables in order (respecting foreign keys)
  await db.delete(schema.orderStatusHistory);
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.ingredientMacros);
  await db.delete(schema.ingredients);
  await db.delete(schema.restaurants);
  await db.delete(schema.users);
  await db.delete(schema.macroTypes);

  console.log("Banco limpo. Inserindo dados...");

  // Tipos de macro nutricionais
  const macroTypes = await db
    .insert(schema.macroTypes)
    .values([
      { name: "Calorias", unit: "kcal", displayOrder: 1 },
      { name: "Proteína", unit: "g", displayOrder: 2 },
      { name: "Carboidratos", unit: "g", displayOrder: 3 },
      { name: "Gordura", unit: "g", displayOrder: 4 },
      { name: "Fibra", unit: "g", displayOrder: 5 },
      { name: "Sódio", unit: "mg", displayOrder: 6 },
    ])
    .returning();

  console.log(`Criados ${macroTypes.length} tipos de macro`);

  // Usuário admin
  const adminPassword = await hashPassword("admin123");
  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@custommade.food",
      passwordHash: adminPassword,
      name: "Administrador",
      role: "admin",
    })
    .returning();

  console.log(`Criado admin: ${admin.email}`);

  // Dono do restaurante
  const ownerPassword = await hashPassword("owner123");
  const [owner] = await db
    .insert(schema.users)
    .values({
      email: "owner@healthybowl.com",
      passwordHash: ownerPassword,
      name: "Maria Silva",
      role: "restaurant_owner",
    })
    .returning();

  // Restaurante
  const [restaurant] = await db
    .insert(schema.restaurants)
    .values({
      name: "Healthy Bowl",
      description: "Refeições saudáveis e personalizáveis com ingredientes frescos",
      address: "Rua das Flores, 123 - São Paulo, SP",
      phone: "(11) 99999-0100",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80",
      ownerId: owner.id,
    })
    .returning();

  // Vincular dono ao restaurante
  await db
    .update(schema.users)
    .set({ restaurantId: restaurant.id })
    .where(eq(schema.users.id, owner.id));

  console.log(`Criado restaurante: ${restaurant.name}`);

  // Equipe da cozinha
  const kitchenPassword = await hashPassword("kitchen123");
  await db.insert(schema.users).values({
    email: "kitchen@healthybowl.com",
    passwordHash: kitchenPassword,
    name: "João Costa",
    role: "kitchen_staff",
    restaurantId: restaurant.id,
  });

  // Cliente
  const customerPassword = await hashPassword("customer123");
  await db.insert(schema.users).values({
    email: "customer@example.com",
    passwordHash: customerPassword,
    name: "Carlos Oliveira",
    role: "customer",
  });

  console.log("Criados usuários (equipe cozinha + cliente)");

  // IDs dos macros
  const caloriasId = macroTypes.find((m) => m.name === "Calorias")!.id;
  const proteinaId = macroTypes.find((m) => m.name === "Proteína")!.id;
  const carbsId = macroTypes.find((m) => m.name === "Carboidratos")!.id;
  const gorduraId = macroTypes.find((m) => m.name === "Gordura")!.id;
  const fibraId = macroTypes.find((m) => m.name === "Fibra")!.id;

  // Ingredientes
  const ingredientData = [
    {
      name: "Arroz Branco",
      category: "Grãos",
      pricePerGram: "0.0050",
      imageUrl: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 130, proteina: 2.7, carbs: 28, gordura: 0.3, fibra: 0.4 },
    },
    {
      name: "Arroz Integral",
      category: "Grãos",
      pricePerGram: "0.0065",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 112, proteina: 2.3, carbs: 24, gordura: 0.8, fibra: 1.8 },
    },
    {
      name: "Feijão Preto",
      category: "Leguminosas",
      pricePerGram: "0.0040",
      imageUrl: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 132, proteina: 8.9, carbs: 23.7, gordura: 0.5, fibra: 8.7 },
    },
    {
      name: "Peito de Frango Grelhado",
      category: "Proteínas",
      pricePerGram: "0.0150",
      imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 165, proteina: 31, carbs: 0, gordura: 3.6, fibra: 0 },
    },
    {
      name: "Carne Moída Magra",
      category: "Proteínas",
      pricePerGram: "0.0180",
      imageUrl: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 250, proteina: 26, carbs: 0, gordura: 15, fibra: 0 },
    },
    {
      name: "Salmão Grelhado",
      category: "Proteínas",
      pricePerGram: "0.0250",
      imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 208, proteina: 20, carbs: 0, gordura: 13, fibra: 0 },
    },
    {
      name: "Brócolis no Vapor",
      category: "Vegetais",
      pricePerGram: "0.0060",
      imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 35, proteina: 2.4, carbs: 7, gordura: 0.4, fibra: 2.6 },
    },
    {
      name: "Batata Doce",
      category: "Vegetais",
      pricePerGram: "0.0055",
      imageUrl: "https://images.unsplash.com/photo-1596097635121-14b63a7b3079?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 86, proteina: 1.6, carbs: 20, gordura: 0.1, fibra: 3 },
    },
    {
      name: "Salada Mista",
      category: "Vegetais",
      pricePerGram: "0.0070",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 20, proteina: 1.5, carbs: 3.5, gordura: 0.2, fibra: 1.8 },
    },
    {
      name: "Abacate",
      category: "Extras",
      pricePerGram: "0.0200",
      imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop&q=80",
      macros: { calorias: 160, proteina: 2, carbs: 8.5, gordura: 14.7, fibra: 6.7 },
    },
  ];

  for (const item of ingredientData) {
    const [ingredient] = await db
      .insert(schema.ingredients)
      .values({
        restaurantId: restaurant.id,
        name: item.name,
        category: item.category,
        pricePerGram: item.pricePerGram,
        imageUrl: item.imageUrl,
        minGrams: 20,
        maxGrams: 400,
      })
      .returning();

    await db.insert(schema.ingredientMacros).values([
      { ingredientId: ingredient.id, macroTypeId: caloriasId, valuePer100g: String(item.macros.calorias) },
      { ingredientId: ingredient.id, macroTypeId: proteinaId, valuePer100g: String(item.macros.proteina) },
      { ingredientId: ingredient.id, macroTypeId: carbsId, valuePer100g: String(item.macros.carbs) },
      { ingredientId: ingredient.id, macroTypeId: gorduraId, valuePer100g: String(item.macros.gordura) },
      { ingredientId: ingredient.id, macroTypeId: fibraId, valuePer100g: String(item.macros.fibra) },
    ]);
  }

  console.log(`Criados ${ingredientData.length} ingredientes com valores nutricionais`);
  console.log("\nSeed finalizado! Credenciais de demo:");
  console.log("  Admin:    admin@custommade.food / admin123");
  console.log("  Dono:     owner@healthybowl.com / owner123");
  console.log("  Cozinha:  kitchen@healthybowl.com / kitchen123");
  console.log("  Cliente:  customer@example.com / customer123");
}

seed().catch(console.error);

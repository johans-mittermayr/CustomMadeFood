import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

// Simple SHA-256 hash for seed data
// The auth system uses bcryptjs, so we hash with bcrypt here too
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

  console.log("Seeding database...");

  // Create macro types
  const macroTypes = await db
    .insert(schema.macroTypes)
    .values([
      { name: "Calories", unit: "kcal", displayOrder: 1 },
      { name: "Protein", unit: "g", displayOrder: 2 },
      { name: "Carbohydrates", unit: "g", displayOrder: 3 },
      { name: "Fat", unit: "g", displayOrder: 4 },
      { name: "Fiber", unit: "g", displayOrder: 5 },
      { name: "Sodium", unit: "mg", displayOrder: 6 },
    ])
    .returning();

  console.log(`Created ${macroTypes.length} macro types`);

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@custommade.food",
      passwordHash: adminPassword,
      name: "Admin",
      role: "admin",
    })
    .returning();

  console.log(`Created admin user: ${admin.email}`);

  // Create restaurant owner
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

  // Create restaurant
  const [restaurant] = await db
    .insert(schema.restaurants)
    .values({
      name: "Healthy Bowl",
      description: "Fresh and customizable healthy meals",
      address: "123 Main Street",
      phone: "+1 555-0100",
      ownerId: owner.id,
    })
    .returning();

  // Update owner with restaurant ID
  await db
    .update(schema.users)
    .set({ restaurantId: restaurant.id })
    .where(eq(schema.users.id, owner.id));

  console.log(`Created restaurant: ${restaurant.name}`);

  // Create kitchen staff
  const kitchenPassword = await hashPassword("kitchen123");
  await db.insert(schema.users).values({
    email: "kitchen@healthybowl.com",
    passwordHash: kitchenPassword,
    name: "João Costa",
    role: "kitchen_staff",
    restaurantId: restaurant.id,
  });

  // Create customer
  const customerPassword = await hashPassword("customer123");
  await db.insert(schema.users).values({
    email: "customer@example.com",
    passwordHash: customerPassword,
    name: "Carlos Oliveira",
    role: "customer",
  });

  console.log("Created users (kitchen staff + customer)");

  // Find macro type IDs
  const caloriesId = macroTypes.find((m) => m.name === "Calories")!.id;
  const proteinId = macroTypes.find((m) => m.name === "Protein")!.id;
  const carbsId = macroTypes.find((m) => m.name === "Carbohydrates")!.id;
  const fatId = macroTypes.find((m) => m.name === "Fat")!.id;
  const fiberId = macroTypes.find((m) => m.name === "Fiber")!.id;

  // Create ingredients
  const ingredientData = [
    {
      name: "White Rice",
      category: "Grains",
      pricePerGram: "0.0050",
      macros: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
    },
    {
      name: "Brown Rice",
      category: "Grains",
      pricePerGram: "0.0065",
      macros: { calories: 112, protein: 2.3, carbs: 24, fat: 0.8, fiber: 1.8 },
    },
    {
      name: "Black Beans",
      category: "Legumes",
      pricePerGram: "0.0040",
      macros: { calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7 },
    },
    {
      name: "Grilled Chicken Breast",
      category: "Protein",
      pricePerGram: "0.0150",
      macros: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    },
    {
      name: "Ground Beef (lean)",
      category: "Protein",
      pricePerGram: "0.0180",
      macros: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
    },
    {
      name: "Grilled Salmon",
      category: "Protein",
      pricePerGram: "0.0250",
      macros: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
    },
    {
      name: "Steamed Broccoli",
      category: "Vegetables",
      pricePerGram: "0.0060",
      macros: { calories: 35, protein: 2.4, carbs: 7, fat: 0.4, fiber: 2.6 },
    },
    {
      name: "Sweet Potato",
      category: "Vegetables",
      pricePerGram: "0.0055",
      macros: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
    },
    {
      name: "Mixed Salad",
      category: "Vegetables",
      pricePerGram: "0.0070",
      macros: { calories: 20, protein: 1.5, carbs: 3.5, fat: 0.2, fiber: 1.8 },
    },
    {
      name: "Avocado",
      category: "Extras",
      pricePerGram: "0.0200",
      macros: { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 },
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
        minGrams: 20,
        maxGrams: 400,
      })
      .returning();

    await db.insert(schema.ingredientMacros).values([
      { ingredientId: ingredient.id, macroTypeId: caloriesId, valuePer100g: String(item.macros.calories) },
      { ingredientId: ingredient.id, macroTypeId: proteinId, valuePer100g: String(item.macros.protein) },
      { ingredientId: ingredient.id, macroTypeId: carbsId, valuePer100g: String(item.macros.carbs) },
      { ingredientId: ingredient.id, macroTypeId: fatId, valuePer100g: String(item.macros.fat) },
      { ingredientId: ingredient.id, macroTypeId: fiberId, valuePer100g: String(item.macros.fiber) },
    ]);
  }

  console.log(`Created ${ingredientData.length} ingredients with nutritional values`);
  console.log("\nSeed completed! Demo credentials:");
  console.log("  Admin:    admin@custommade.food / admin123");
  console.log("  Owner:    owner@healthybowl.com / owner123");
  console.log("  Kitchen:  kitchen@healthybowl.com / kitchen123");
  console.log("  Customer: customer@example.com / customer123");
}

seed().catch(console.error);

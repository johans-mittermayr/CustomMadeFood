import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const RESTAURANT_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80";

const INGREDIENT_IMAGES: Record<string, string> = {
  "White Rice": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=300&fit=crop&q=80",
  "Brown Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80",
  "Black Beans": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=300&fit=crop&q=80",
  "Grilled Chicken Breast": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop&q=80",
  "Ground Beef (lean)": "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=300&fit=crop&q=80",
  "Grilled Salmon": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&q=80",
  "Steamed Broccoli": "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop&q=80",
  "Sweet Potato": "https://images.unsplash.com/photo-1596097635121-14b63a7b3079?w=400&h=300&fit=crop&q=80",
  "Mixed Salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80",
  "Avocado": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop&q=80",
};

async function addImages() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql, { schema });

  // Update restaurant image
  const restaurants = await db.select().from(schema.restaurants);
  for (const restaurant of restaurants) {
    await db
      .update(schema.restaurants)
      .set({ imageUrl: RESTAURANT_IMAGE })
      .where(eq(schema.restaurants.id, restaurant.id));
    console.log(`Updated restaurant image: ${restaurant.name}`);
  }

  // Update ingredient images
  const ingredients = await db.select().from(schema.ingredients);
  for (const ingredient of ingredients) {
    const imageUrl = INGREDIENT_IMAGES[ingredient.name];
    if (imageUrl) {
      await db
        .update(schema.ingredients)
        .set({ imageUrl })
        .where(eq(schema.ingredients.id, ingredient.id));
      console.log(`Updated ingredient image: ${ingredient.name}`);
    }
  }

  console.log("\nDone! All images updated.");
}

addImages().catch(console.error);

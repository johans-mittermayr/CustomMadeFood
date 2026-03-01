import { pgTable, uuid, varchar, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { restaurants } from "./restaurants";
import { macroTypes } from "./macros";

export const ingredients = pgTable("ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  pricePerGram: numeric("price_per_gram", { precision: 10, scale: 4 }).notNull(),
  minGrams: integer("min_grams").notNull().default(10),
  maxGrams: integer("max_grams").notNull().default(500),
  isAvailable: boolean("is_available").notNull().default(true),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ingredientMacros = pgTable("ingredient_macros", {
  id: uuid("id").defaultRandom().primaryKey(),
  ingredientId: uuid("ingredient_id").references(() => ingredients.id, { onDelete: "cascade" }).notNull(),
  macroTypeId: uuid("macro_type_id").references(() => macroTypes.id).notNull(),
  valuePer100g: numeric("value_per_100g", { precision: 10, scale: 2 }).notNull(),
});

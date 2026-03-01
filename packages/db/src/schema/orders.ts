import { pgTable, uuid, varchar, numeric, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { restaurants } from "./restaurants";
import { ingredients } from "./ingredients";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "accepted",
  "preparing",
  "weighing",
  "ready",
  "delivered",
  "cancelled",
]);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => users.id).notNull(),
  restaurantId: uuid("restaurant_id").references(() => restaurants.id).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  currentItemIndex: integer("current_item_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  ingredientId: uuid("ingredient_id").references(() => ingredients.id).notNull(),
  quantityGrams: integer("quantity_grams").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  status: orderStatusEnum("status").notNull(),
  changedBy: uuid("changed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

import { pgTable, uuid, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const macroTypes = pgTable("macro_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  unit: varchar("unit", { length: 20 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

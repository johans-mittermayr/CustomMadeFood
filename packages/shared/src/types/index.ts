export type UserRole = "admin" | "restaurant_owner" | "kitchen_staff" | "customer";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "weighing"
  | "ready"
  | "delivered"
  | "cancelled";

export interface MacroTotal {
  macroTypeId: string;
  name: string;
  unit: string;
  total: number;
}

export interface OrderItemSelection {
  ingredientId: string;
  name: string;
  quantityGrams: number;
  pricePerGram: number;
}

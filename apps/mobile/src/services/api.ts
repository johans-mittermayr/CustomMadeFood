import * as SecureStore from "expo-secure-store";

// Change this to your Vercel URL in production
const API_BASE = __DEV__
  ? "http://10.0.2.2:3000" // Android emulator -> host machine
  : "https://your-app.vercel.app";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurantId: string | null;
}

export interface OrderItem {
  id: string;
  ingredientId: string;
  quantityGrams: number;
  price: string;
  sortOrder: number;
  ingredientName: string;
  ingredientCategory: string | null;
}

export interface Order {
  id: string;
  status: string;
  currentItemIndex: number;
  totalPrice: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export const api = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/mobile/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Falha no login");
    }

    const data = await res.json();
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(data.user));
    return data;
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    if (!userStr) return null;
    const token = await getToken();
    if (!token) return null;
    return JSON.parse(userStr);
  },

  async getKitchenOrders(): Promise<Order[]> {
    const res = await authFetch("/api/kitchen/orders");
    if (!res.ok) throw new Error("Falha ao buscar pedidos");
    return res.json();
  },

  async acceptOrder(orderId: string): Promise<void> {
    await authFetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "accepted" }),
    });
  },

  async startWeighing(orderId: string): Promise<void> {
    await authFetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: "weighing" }),
    });
  },

  async nextIngredient(orderId: string): Promise<void> {
    await authFetch(`/api/kitchen/orders/${orderId}/next`, {
      method: "PUT",
    });
  },
};

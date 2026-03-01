"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KITCHEN_POLL_INTERVAL_MS, ORDER_STATUSES } from "@custom-made-food/shared";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  ingredientName: string;
  ingredientCategory: string | null;
  quantityGrams: number;
  sortOrder: number;
}

interface Order {
  id: string;
  status: string;
  currentItemIndex: number;
  createdAt: string;
  items: OrderItem[];
}

export default function KitchenPage() {
  const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    const res = await fetch("/api/kitchen/orders");
    if (res.ok) {
      setKitchenOrders(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, KITCHEN_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function acceptOrder(orderId: string) {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });
    fetchOrders();
    toast.success("Pedido aceito");
  }

  async function startWeighing(orderId: string) {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "weighing" }),
    });
    fetchOrders();
  }

  async function nextIngredient(orderId: string) {
    await fetch(`/api/kitchen/orders/${orderId}/next`, { method: "PUT" });
    fetchOrders();
  }

  if (loading) {
    return <div className="text-gray-500">Carregando pedidos da cozinha...</div>;
  }

  const pendingOrders = kitchenOrders.filter((o) => o.status === "pending");
  const activeOrders = kitchenOrders.filter((o) =>
    ["accepted", "preparing", "weighing"].includes(o.status)
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Visão da Cozinha</h1>
      <p className="text-gray-500 mb-8">
        Atualiza automaticamente a cada {KITCHEN_POLL_INTERVAL_MS / 1000}s
      </p>

      {/* Pedidos Pendentes */}
      {pendingOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-700 mb-4">
            Pedidos Pendentes ({pendingOrders.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Pedido #{order.id.slice(0, 8)}
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 mb-4 text-sm">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.ingredientName} — <strong>{item.quantityGrams}g</strong>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => acceptOrder(order.id)}
                    className="w-full bg-brand-green hover:bg-brand-green-dark"
                  >
                    Aceitar Pedido
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos Ativos / Pesagem */}
      {activeOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-purple-700 mb-4">
            Pedidos Ativos ({activeOrders.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {activeOrders.map((order) => {
              const isWeighing = order.status === "weighing";
              const currentItem = order.items[order.currentItemIndex];
              const progress =
                order.items.length > 0
                  ? (order.currentItemIndex / order.items.length) * 100
                  : 0;

              return (
                <Card
                  key={order.id}
                  className={isWeighing ? "border-purple-300 ring-2 ring-purple-100" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        Pedido #{order.id.slice(0, 8)}
                      </CardTitle>
                      <span className="text-xs text-gray-500">
                        {order.currentItemIndex}/{order.items.length} itens
                      </span>
                    </div>
                    {/* Barra de progresso */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-brand-red to-brand-orange h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isWeighing && currentItem ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-1">
                          Agora pese:
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {currentItem.ingredientName}
                        </p>
                        <p className="text-4xl font-bold text-brand-green my-4">
                          {currentItem.quantityGrams}g
                        </p>
                        <Button
                          onClick={() => nextIngredient(order.id)}
                          size="lg"
                          className="w-full bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-red text-lg py-6"
                        >
                          {order.currentItemIndex + 1 >= order.items.length
                            ? "Finalizar Pedido"
                            : "Próximo Ingrediente"}
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <ul className="space-y-1 mb-4 text-sm">
                          {order.items.map((item, i) => (
                            <li
                              key={item.id}
                              className={
                                i < order.currentItemIndex
                                  ? "line-through text-gray-400"
                                  : ""
                              }
                            >
                              {item.ingredientName} — <strong>{item.quantityGrams}g</strong>
                            </li>
                          ))}
                        </ul>
                        <Button
                          onClick={() => startWeighing(order.id)}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          Iniciar Pesagem
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {pendingOrders.length === 0 && activeOrders.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">Nenhum pedido no momento</p>
          <p className="text-sm mt-2">Novos pedidos aparecerão aqui automaticamente</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUSES } from "@custom-made-food/shared";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  ingredientName: string;
  quantityGrams: number;
  price: string;
}

interface Order {
  id: string;
  status: string;
  totalPrice: string;
  notes: string | null;
  currentItemIndex: number;
  createdAt: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  preparing: "bg-indigo-100 text-indigo-800",
  weighing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
    const res = await fetch("/api/orders");
    setOrdersList(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function updateStatus(orderId: string, status: string) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      toast.success(`Pedido ${status === "accepted" ? "aceito" : status === "cancelled" ? "cancelado" : status === "weighing" ? "em pesagem" : status === "delivered" ? "entregue" : status}`);
      fetchOrders();
    }
  }

  if (loading) {
    return <div className="text-gray-500">Carregando pedidos...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pedidos</h1>

      {ordersList.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido ainda.</p>
      ) : (
        <div className="grid gap-4">
          {ordersList.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      Pedido #{order.id.slice(0, 8)}
                    </CardTitle>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                    >
                      {ORDER_STATUSES[order.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-brand-green">
                      R${order.totalPrice}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        {item.ingredientName} — {item.quantityGrams}g
                      </span>
                      <span className="text-gray-500">R${item.price}</span>
                    </div>
                  ))}
                </div>
                {order.notes && (
                  <p className="text-sm text-gray-500 italic mb-4">
                    Obs: {order.notes}
                  </p>
                )}
                <div className="flex gap-2">
                  {order.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(order.id, "accepted")}
                        className="bg-brand-green hover:bg-brand-green-dark"
                      >
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(order.id, "cancelled")}
                      >
                        Rejeitar
                      </Button>
                    </>
                  )}
                  {order.status === "accepted" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order.id, "weighing")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Iniciar Pesagem
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order.id, "delivered")}
                    >
                      Marcar como Entregue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

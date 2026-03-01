"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUSES } from "@custom-made-food/shared";

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

export default function CustomerOrdersPage() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrdersList(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red-light via-white to-brand-orange-light">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-red to-brand-orange">
                <span className="text-sm font-bold text-white">CM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                CustomMadeFood
              </span>
            </Link>
            <Link href="/restaurants" className="text-sm text-brand-green hover:underline">
              Ver restaurantes
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

        {loading ? (
          <p className="text-gray-500">Carregando pedidos...</p>
        ) : ordersList.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-xl">Nenhum pedido ainda</p>
            <Link href="/restaurants" className="text-brand-green hover:underline text-sm mt-2 inline-block">
              Navegue pelos restaurantes para começar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordersList.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Order #{order.id.slice(0, 8)}
                    </CardTitle>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                    >
                      {ORDER_STATUSES[order.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 mb-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.ingredientName} — {item.quantityGrams}g
                        </span>
                        <span className="text-gray-500">R${item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-brand-green">R${order.totalPrice}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

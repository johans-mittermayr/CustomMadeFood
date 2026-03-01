import { db } from "@/lib/db";
import { users, restaurants, orders } from "@custom-made-food/db";
import { count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const [userCount] = await db.select({ count: count() }).from(users);
  const [restaurantCount] = await db
    .select({ count: count() })
    .from(restaurants);
  const [orderCount] = await db.select({ count: count() }).from(orders);

  const stats = [
    { label: "Total de Usuários", value: userCount.count, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Restaurantes", value: restaurantCount.count, color: "text-brand-green", bg: "bg-brand-green-light" },
    { label: "Total de Pedidos", value: orderCount.count, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Painel Administrativo
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

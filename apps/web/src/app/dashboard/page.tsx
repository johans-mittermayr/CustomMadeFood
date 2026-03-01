import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, ingredients } from "@custom-made-food/db";
import { eq, and, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user as any;
  const restaurantId = user.restaurantId;

  if (!restaurantId) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Painel do Restaurante</h1>
        <p className="text-gray-500">
          Nenhum restaurante vinculado à sua conta. Contate um administrador.
        </p>
      </div>
    );
  }

  const [pendingCount] = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(eq(orders.restaurantId, restaurantId), eq(orders.status, "pending"))
    );

  const [activeCount] = await db
    .select({ count: count() })
    .from(orders)
    .where(
      and(
        eq(orders.restaurantId, restaurantId),
        eq(orders.status, "preparing")
      )
    );

  const [ingredientCount] = await db
    .select({ count: count() })
    .from(ingredients)
    .where(eq(ingredients.restaurantId, restaurantId));

  const [totalOrderCount] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.restaurantId, restaurantId));

  const stats = [
    { label: "Pedidos Pendentes", value: pendingCount.count, color: "text-yellow-600" },
    { label: "Pedidos Ativos", value: activeCount.count, color: "text-blue-600" },
    { label: "Ingredientes", value: ingredientCount.count, color: "text-brand-green" },
    { label: "Total de Pedidos", value: totalOrderCount.count, color: "text-purple-600" },
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Image src="/logoCMF.png" alt="CMF" width={48} height={48} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Painel do Restaurante
          </h1>
          <p className="text-sm text-gray-500">Gerencie seus pedidos e ingredientes</p>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-6">
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

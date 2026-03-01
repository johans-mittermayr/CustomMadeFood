"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  imageUrl: string | null;
}

export default function RestaurantsPage() {
  const [restaurantsList, setRestaurantsList] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((data) => {
        setRestaurantsList(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red-light via-white to-brand-orange-light">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logoCMF.png" alt="CMF" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold text-gray-900">
                CustomMadeFood
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Restaurantes
        </h1>
        {loading ? (
          <p className="text-gray-500">Carregando restaurantes...</p>
        ) : restaurantsList.length === 0 ? (
          <p className="text-gray-500">Nenhum restaurante disponível ainda.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantsList.map((r) => (
              <Link key={r.id} href={`/restaurants/${r.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  <div className="relative h-48 w-full">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-red-light to-brand-orange-light flex items-center justify-center">
                        <span className="text-4xl text-brand-red">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        </span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{r.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {r.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {r.description}
                      </p>
                    )}
                    {r.address && (
                      <p className="text-xs text-gray-400">{r.address}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

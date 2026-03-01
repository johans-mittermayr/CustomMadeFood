"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Macro {
  macroTypeId: string;
  valuePer100g: string;
  name: string;
  unit: string;
}

interface Ingredient {
  id: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
  pricePerGram: string;
  minGrams: number;
  maxGrams: number;
  macros: Macro[];
}

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  ingredients: Ingredient[];
}

interface Selection {
  ingredientId: string;
  grams: number;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setRestaurant(data);
        setLoading(false);
      });
  }, [params.id]);

  function setGrams(ingredientId: string, grams: number) {
    setSelections((prev) => {
      if (grams === 0) {
        const { [ingredientId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [ingredientId]: grams };
    });
  }

  // Calculate totals
  const selectedItems = restaurant?.ingredients.filter(
    (i) => selections[i.id] && selections[i.id] > 0
  ) || [];

  const totalPrice = selectedItems.reduce(
    (sum, i) => sum + Number(i.pricePerGram) * selections[i.id],
    0
  );

  // Aggregate macros
  const macroTotals: Record<string, { name: string; unit: string; total: number }> = {};
  selectedItems.forEach((ingredient) => {
    const grams = selections[ingredient.id];
    ingredient.macros.forEach((macro) => {
      const value = (Number(macro.valuePer100g) / 100) * grams;
      if (!macroTotals[macro.macroTypeId]) {
        macroTotals[macro.macroTypeId] = {
          name: macro.name,
          unit: macro.unit,
          total: 0,
        };
      }
      macroTotals[macro.macroTypeId].total += value;
    });
  });

  async function placeOrder() {
    if (!session) {
      router.push(`/login?callbackUrl=/restaurants/${params.id}`);
      return;
    }

    setSubmitting(true);
    const items = Object.entries(selections)
      .filter(([_, grams]) => grams > 0)
      .map(([ingredientId, grams]) => ({
        ingredientId,
        quantityGrams: grams,
      }));

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId: params.id,
        items,
        notes: notes || null,
      }),
    });

    if (res.ok) {
      toast.success("Pedido realizado com sucesso!");
      router.push("/orders");
    } else {
      toast.error("Falha ao realizar pedido");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Restaurante não encontrado
      </div>
    );
  }

  // Group by category
  const categories: Record<string, Ingredient[]> = {};
  restaurant.ingredients.forEach((i) => {
    const cat = i.category || "Outros";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(i);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-red-light via-white to-brand-orange-light">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/restaurants" className="flex items-center gap-2">
              <Image src="/logoCMF.png" alt="CMF" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold text-gray-900">
                CustomMadeFood
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {restaurant.name}
        </h1>
        {restaurant.description && (
          <p className="text-gray-600 mb-8">{restaurant.description}</p>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients Selection */}
          <div className="lg:col-span-2 space-y-8">
            {Object.entries(categories).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {category}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {items.map((ingredient) => {
                    const grams = selections[ingredient.id] || 0;
                    const isSelected = grams > 0;

                    return (
                      <Card
                        key={ingredient.id}
                        className={`overflow-hidden ${
                          isSelected
                            ? "ring-2 ring-brand-red/30 border-brand-red/20"
                            : ""
                        }`}
                      >
                        {ingredient.imageUrl && (
                          <div className="relative h-32 w-full">
                            <img
                              src={ingredient.imageUrl}
                              alt={ingredient.name}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-brand-red text-white shadow-lg">
                                  {grams}g
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {ingredient.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                  R${(Number(ingredient.pricePerGram) * 100).toFixed(2)}/100g
                              </p>
                            </div>
                            {isSelected && !ingredient.imageUrl && (
                              <Badge className="bg-brand-red-light text-brand-red">
                                {grams}g
                              </Badge>
                            )}
                          </div>

                          {/* Micro macro info */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {ingredient.macros.slice(0, 4).map((m) => (
                              <span
                                key={m.macroTypeId}
                                className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600"
                              >
                                {m.name}: {m.valuePer100g}{m.unit}/100g
                              </span>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <Slider
                              value={[grams]}
                              min={0}
                              max={ingredient.maxGrams}
                              step={10}
                              onValueChange={([val]) =>
                                setGrams(ingredient.id, val)
                              }
                              className="py-2"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>0g</span>
                              <span>{ingredient.maxGrams}g</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Seu Prato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedItems.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Deslize para adicionar ingredientes ao seu prato
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {selectedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.name}{" "}
                              <span className="text-gray-500">
                                ({selections[item.id]}g)
                              </span>
                            </span>
                            <span className="font-medium">
                              R$
                              {(
                                Number(item.pricePerGram) * selections[item.id]
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Totais Nutricionais
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.values(macroTotals).map((macro) => (
                            <div
                              key={macro.name}
                              className="bg-gray-50 rounded-lg p-2 text-center"
                            >
                              <div className="text-lg font-bold text-brand-green">
                                {macro.total.toFixed(1)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {macro.name} ({macro.unit})
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <Textarea
                          placeholder="Alguma observação? (opcional)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="mb-3"
                        />
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold">Total</span>
                          <span className="text-xl font-bold text-brand-green">
                            R${totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <Button
                          onClick={placeOrder}
                          disabled={submitting}
                          className="w-full bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-red py-6 text-lg"
                        >
                          {submitting ? "Fazendo pedido..." : "Fazer Pedido"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface MacroType {
  id: string;
  name: string;
  unit: string;
}

interface Ingredient {
  id: string;
  name: string;
  category: string | null;
  pricePerGram: string;
  minGrams: number;
  maxGrams: number;
  isAvailable: boolean;
  macros: { macroTypeId: string; valuePer100g: string; macroName: string; macroUnit: string }[];
}

export default function IngredientsPage() {
  const { data: session } = useSession();
  const restaurantId = (session?.user as any)?.restaurantId;
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [macroTypesList, setMacroTypesList] = useState<MacroType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [macroValues, setMacroValues] = useState<Record<string, string>>({});

  async function fetchData() {
    if (!restaurantId) return;
    const [ingRes, macroRes] = await Promise.all([
      fetch(`/api/ingredients?restaurantId=${restaurantId}`),
      fetch("/api/admin/macro-types"),
    ]);
    setIngredientsList(await ingRes.json());
    setMacroTypesList(await macroRes.json());
    setLoading(false);
  }

  useEffect(() => {
    if (restaurantId) fetchData();
  }, [restaurantId]);

  function openEdit(ingredient: Ingredient) {
    setEditing(ingredient);
    const values: Record<string, string> = {};
    ingredient.macros.forEach((m) => {
      values[m.macroTypeId] = m.valuePer100g;
    });
    setMacroValues(values);
    setDialogOpen(true);
  }

  function openNew() {
    setEditing(null);
    setMacroValues({});
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const macros = macroTypesList
      .filter((mt) => macroValues[mt.id])
      .map((mt) => ({
        macroTypeId: mt.id,
        valuePer100g: macroValues[mt.id],
      }));

    const body = {
      name: formData.get("name"),
      category: formData.get("category"),
      pricePerGram: formData.get("pricePerGram"),
      minGrams: Number(formData.get("minGrams")),
      maxGrams: Number(formData.get("maxGrams")),
      restaurantId,
      macros,
    };

    const url = editing ? `/api/ingredients/${editing.id}` : "/api/ingredients";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editing ? "Ingrediente atualizado" : "Ingrediente criado");
      setDialogOpen(false);
      setEditing(null);
      fetchData();
    } else {
      toast.error("Algo deu errado");
    }
  }

  async function toggleAvailable(id: string, isAvailable: boolean) {
    await fetch(`/api/ingredients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !isAvailable }),
    });
    fetchData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ingredientes</h1>
          <p className="text-gray-500 mt-1">
            Gerencie seus ingredientes e valores nutricionais
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setMacroValues({}); } }}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-red">
              Adicionar ingrediente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar ingrediente" : "Novo ingrediente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" name="name" defaultValue={editing?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input id="category" name="category" defaultValue={editing?.category || ""} placeholder="ex: Proteína" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerGram">Preço/grama</Label>
                  <Input id="pricePerGram" name="pricePerGram" type="number" step="0.0001" defaultValue={editing?.pricePerGram} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minGrams">Mín. gramas</Label>
                  <Input id="minGrams" name="minGrams" type="number" defaultValue={editing?.minGrams || 10} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGrams">Máx. gramas</Label>
                  <Input id="maxGrams" name="maxGrams" type="number" defaultValue={editing?.maxGrams || 500} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Valores nutricionais (por 100g)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {macroTypesList.map((mt) => (
                    <div key={mt.id} className="flex items-center gap-2">
                      <Label className="text-sm w-28 shrink-0">
                        {mt.name} ({mt.unit})
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={macroValues[mt.id] || ""}
                        onChange={(e) =>
                          setMacroValues((prev) => ({
                            ...prev,
                            [mt.id]: e.target.value,
                          }))
                        }
                        placeholder="0"
                        className="h-8"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-brand-red to-brand-orange">
                {editing ? "Atualizar" : "Criar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço/g</TableHead>
                <TableHead>Faixa</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">Carregando...</TableCell>
                </TableRow>
              ) : ingredientsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">Nenhum ingrediente ainda.</TableCell>
                </TableRow>
              ) : (
                ingredientsList.map((ing) => (
                  <TableRow key={ing.id}>
                    <TableCell className="font-medium">{ing.name}</TableCell>
                    <TableCell>
                      {ing.category && <Badge variant="secondary">{ing.category}</Badge>}
                    </TableCell>
                    <TableCell>R${ing.pricePerGram}</TableCell>
                    <TableCell>{ing.minGrams}g - {ing.maxGrams}g</TableCell>
                    <TableCell>
                      <Switch checked={ing.isAvailable} onCheckedChange={() => toggleAvailable(ing.id, ing.isAvailable)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(ing)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

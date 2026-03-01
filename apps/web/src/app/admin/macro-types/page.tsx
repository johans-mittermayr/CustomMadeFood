"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  displayOrder: number;
  isActive: boolean;
}

export default function MacroTypesPage() {
  const [macroTypes, setMacroTypes] = useState<MacroType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MacroType | null>(null);

  async function fetchMacroTypes() {
    const res = await fetch("/api/admin/macro-types");
    const data = await res.json();
    setMacroTypes(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchMacroTypes();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      unit: formData.get("unit"),
      displayOrder: Number(formData.get("displayOrder")) || 0,
    };

    const url = editing
      ? `/api/admin/macro-types/${editing.id}`
      : "/api/admin/macro-types";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editing ? "Tipo de macro atualizado" : "Tipo de macro criado");
      setDialogOpen(false);
      setEditing(null);
      fetchMacroTypes();
    } else {
      const data = await res.json();
      toast.error(data.error || "Algo deu errado");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/macro-types/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchMacroTypes();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tipos de Macro</h1>
          <p className="text-gray-500 mt-1">
            Gerencie as categorias nutricionais disponíveis para ingredientes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-red">
              Adicionar tipo de macro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar tipo de macro" : "Novo tipo de macro"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="ex: Vitamina D"
                  defaultValue={editing?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  name="unit"
                  placeholder="ex: mg, g, kcal"
                  defaultValue={editing?.unit}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Ordem de exibição</Label>
                <Input
                  id="displayOrder"
                  name="displayOrder"
                  type="number"
                  defaultValue={editing?.displayOrder || macroTypes.length + 1}
                />
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
                <TableHead>Unidade</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : macroTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhum tipo de macro ainda. Crie o primeiro.
                  </TableCell>
                </TableRow>
              ) : (
                macroTypes.map((macro) => (
                  <TableRow key={macro.id}>
                    <TableCell className="font-medium">{macro.name}</TableCell>
                    <TableCell>{macro.unit}</TableCell>
                    <TableCell>{macro.displayOrder}</TableCell>
                    <TableCell>
                      <Switch
                        checked={macro.isActive}
                        onCheckedChange={() =>
                          toggleActive(macro.id, macro.isActive)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(macro);
                          setDialogOpen(true);
                        }}
                      >
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

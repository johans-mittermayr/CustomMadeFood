"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  ownerId: string;
  ownerName?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);

  async function fetchData() {
    const [resRes, usersRes] = await Promise.all([
      fetch("/api/admin/restaurants"),
      fetch("/api/admin/users?role=restaurant_owner"),
    ]);
    setRestaurants(await resRes.json());
    setOwners(await usersRes.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name"),
      description: formData.get("description"),
      address: formData.get("address"),
      phone: formData.get("phone"),
      ownerId: formData.get("ownerId"),
    };

    const url = editing
      ? `/api/admin/restaurants/${editing.id}`
      : "/api/admin/restaurants";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(editing ? "Restaurante atualizado" : "Restaurante criado");
      setDialogOpen(false);
      setEditing(null);
      fetchData();
    } else {
      const data = await res.json();
      toast.error(data.error || "Algo deu errado");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurantes</h1>
          <p className="text-gray-500 mt-1">Gerencie os restaurantes da plataforma</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-brand-red to-brand-orange hover:from-brand-red-dark hover:to-brand-red">
              Adicionar restaurante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar restaurante" : "Novo restaurante"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editing?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editing?.description || ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editing?.address || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={editing?.phone || ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerId">Proprietário</Label>
                <Select name="ownerId" defaultValue={editing?.ownerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um proprietário" />
                  </SelectTrigger>
                  <SelectContent>
                    {owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <TableHead>Endereço</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
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
              ) : restaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhum restaurante ainda.
                  </TableCell>
                </TableRow>
              ) : (
                restaurants.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.address || "—"}</TableCell>
                    <TableCell>{r.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.isActive ? "default" : "secondary"}>
                        {r.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(r);
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

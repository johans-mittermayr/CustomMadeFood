"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { USER_ROLES } from "@custom-made-food/shared";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleBadgeColor: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  restaurant_owner: "bg-blue-100 text-blue-700",
  kitchen_staff: "bg-yellow-100 text-yellow-700",
  customer: "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsersList(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-500 mt-1">Todos os usuários cadastrados</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : (
                usersList.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor[u.role] || ""}`}>
                        {USER_ROLES[u.role] || u.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(u.createdAt).toLocaleDateString()}
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

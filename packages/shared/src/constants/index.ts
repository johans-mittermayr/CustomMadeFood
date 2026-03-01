export const ORDER_STATUSES: Record<string, string> = {
  pending: "Pendente",
  accepted: "Aceito",
  preparing: "Preparando",
  weighing: "Pesando",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const USER_ROLES: Record<string, string> = {
  admin: "Administrador",
  restaurant_owner: "Dono do Restaurante",
  kitchen_staff: "Equipe da Cozinha",
  customer: "Cliente",
};

export const KITCHEN_POLL_INTERVAL_MS = 5000;

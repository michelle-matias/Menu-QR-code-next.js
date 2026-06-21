export type DishCategory = 'Starters' | 'Mains' | 'Desserts' | 'Drinks';

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: DishCategory;
  image_url: string | null;
  user_id: string;
  created_at: string;
}

export interface OrderItem {
  qty: number;
  nome: string;
  preco: number;
}

export type OrderStatus = 'pending' | 'done';

export interface Order {
  id: number;
  status: OrderStatus | null;
  total: number;
  table_number: string | null;
  itens: OrderItem[];
  user_id: string;
  created_at: string;
  criado_em: string;
}

export interface UserMetadata {
  display_name?: string;
  displayName?: string;
}

export interface User {
  id: string;
  email?: string;
  user_metadata: UserMetadata;
}

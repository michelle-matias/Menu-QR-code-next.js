import { supabase } from './supabase';
import { Dish, Order, OrderStatus } from '@/types';

// Dishes database utilities
export const getDishes = async (userId: string): Promise<Dish[]> => {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createDish = async (dish: Omit<Dish, 'id' | 'created_at'>): Promise<Dish> => {
  const { data, error } = await supabase
    .from('dishes')
    .insert(dish)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDish = async (id: string, userId: string, dish: Partial<Dish>): Promise<Dish> => {
  const { data, error } = await supabase
    .from('dishes')
    .update(dish)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDish = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('dishes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

// Orders database utilities
export const getOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateOrderStatus = async (id: number, userId: string, status: OrderStatus): Promise<void> => {
  const { error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

// Statistics database utilities
export interface DayStats {
  orders: number;
  revenue: number;
  avg: number;
}

export const getOrdersForDateRange = async (
  userId: string,
  from: Date,
  to: Date
): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('user_id', userId)
    .gte('criado_em', from.toISOString())
    .lt('criado_em', to.toISOString());

  if (error) throw error;
  return data || [];
};

export const getDayStats = async (userId: string, date: Date): Promise<DayStats> => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const orders = await getOrdersForDateRange(userId, dayStart, dayEnd);
  const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return {
    orders: orders.length,
    revenue,
    avg: orders.length > 0 ? revenue / orders.length : 0,
  };
};

export interface TopDish {
  name: string;
  count: number;
}

export const getTopDishes = async (userId: string, limit = 5): Promise<TopDish[]> => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('itens')
    .eq('user_id', userId);

  if (error) throw error;


  // Count dish occurrences from all order items
  const dishCounts: Record<string, number> = {};
  for (const order of data || []) {
    const rawItens = typeof order.itens === 'string' ? JSON.parse(order.itens) : order.itens;
    const items: { nome?: string; name?: string; qty?: number }[] =
        Array.isArray(rawItens) ? rawItens : [];
    for (const item of items) {
      const name = item.nome || item.name || 'Unknown';
      dishCounts[name] = (dishCounts[name] || 0) + (item.qty || 1);
    }
  }

  return Object.entries(dishCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const getHourlyOrderCounts = async (userId: string, date: Date): Promise<{ hour: string; value: number }[]> => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const orders = await getOrdersForDateRange(userId, dayStart, dayEnd);

  // Group by hour
  const hourCounts: Record<number, number> = {};
  for (const order of orders) {
    if (order.criado_em) {
      const hour = new Date(order.criado_em).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  }

  // Return only hours with orders
  return Object.entries(hourCounts)
    .map(([h, value]) => ({ hour: `${h}h`, value }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
};

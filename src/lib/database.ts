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

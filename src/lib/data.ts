import { supabase } from './supabase';
import type { Product } from '../types';
export const getSettings = async () => (await supabase.from('settings').select('*').eq('id', 1).single()).data;
export const listProducts = async (f: any = {}): Promise<Product[]> => {
  let q = supabase.from('products').select('*').eq('active', true);
  if (f.featured) q = q.eq('featured', true);
  if (f.sale) q = q.eq('sale', true);
  if (f.category) q = q.eq('category_id', f.category);
  if (f.search) q = q.ilike('name', `%${f.search}%`);
  if (f.maxPrice) q = q.lte('price', f.maxPrice);
  const sort = f.sort || 'new';
  q = sort === 'low' ? q.order('price') : sort === 'high' ? q.order('price', { ascending: false }) : sort === 'popular' ? q.order('featured', { ascending: false }).order('created_at', { ascending: false }) : q.order('created_at', { ascending: false });
  const { data, error } = await q.limit(f.limit || 60);
  if (error) throw error;
  return data as Product[];
};

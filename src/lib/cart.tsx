import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '../types';

export interface Line { id: string; name: string; slug: string; price: number; image: string | null; stock: number; qty: number }
const Ctx = createContext<any>(null);
export const useCart = () => useContext(Ctx);
export const money = (n: number) => '₹' + Number(n).toLocaleString('en-IN');

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>(() => { try { return JSON.parse(localStorage.getItem('sabc_cart') || '[]'); } catch { return []; } });
  useEffect(() => localStorage.setItem('sabc_cart', JSON.stringify(lines)), [lines]);

  const add = (p: Product, q = 1) => {
    if (p.stock < 1) { toast.error('Out of stock'); return false; }
    const ex = lines.find(l => l.id === p.id);
    const next = Math.min((ex?.qty || 0) + q, p.stock);
    if (ex && next === ex.qty) { toast.error(`Only ${p.stock} available`); return false; }
    const line = { id: p.id, name: p.name, slug: p.slug, price: p.price, image: p.images[0] ?? null, stock: p.stock, qty: next };
    setLines(ex ? lines.map(l => (l.id === p.id ? line : l)) : [...lines, line]);
    toast.success('Added to cart');
    return true;
  };
  const setQty = (id: string, q: number) => setLines(lines.map(l => (l.id === id ? { ...l, qty: Math.max(1, Math.min(q, l.stock)) } : l)));
  const remove = (id: string) => setLines(lines.filter(l => l.id !== id));
  const clear = () => setLines([]);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  return <Ctx.Provider value={{ lines, add, setQty, remove, clear, count, subtotal }}>{children}</Ctx.Provider>;
}

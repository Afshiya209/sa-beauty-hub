import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart, money } from '../lib/cart';
import type { Product } from '../types';

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const off = p.original_price && p.original_price > p.price ? Math.round((1 - p.price / p.original_price) * 100) : 0;
  return (
    <div className="group border border-gold/20 hover:border-gold/60 transition">
      <Link to={`/product/${p.slug}`} className="block relative aspect-[4/5] bg-white/5 overflow-hidden">
        {p.images[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          : <div className="h-full grid place-items-center"><img src="/logo.png" alt="" className="w-1/2 opacity-30" /></div>}
        {p.images[1] && <img src={p.images[1]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition duration-500" />}
        {off > 0 && <span className="absolute top-2 left-2 bg-blush text-ink text-[10px] font-semibold px-2 py-1">{off}% OFF</span>}
        {p.stock < 1 && <span className="absolute inset-x-0 bottom-0 bg-black/80 text-center text-xs tracking-widest py-2">OUT OF STOCK</span>}
      </Link>
      <div className="p-3 sm:p-4">
        <Link to={`/product/${p.slug}`} className="font-serif text-sm sm:text-base line-clamp-2 min-h-[2.5rem] hover:text-gold">{p.name}</Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-gold font-semibold">{money(p.price)}</span>
          {off > 0 && <span className="text-muted text-xs line-through">{money(p.original_price!)}</span>}
        </div>
        <button onClick={() => add(p)} disabled={p.stock < 1} className="btn-ghost w-full mt-3 !py-2"><ShoppingBag size={14} />Add</button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, waLink } from '../lib/supabase';
import { useCart, money } from '../lib/cart';
import { Loading, ErrorBox, useAsync } from '../components/ui';
import type { Product } from '../types';

export default function ProductPage() {
  const { slug } = useParams(); const { add } = useCart(); const nav = useNavigate();
  const [qty, setQty] = useState(1); const [img, setImg] = useState(0);
  const { data: p, loading, error } = useAsync(async () => { const { data, error } = await supabase.from('products').select('*').eq('slug', slug).eq('active', true).single(); if (error) throw error; return data as Product; }, [slug]);
  if (loading) return <Loading />;
  if (error || !p) return <ErrorBox msg="Product not found." />;
  const off = p.original_price && p.original_price > p.price ? Math.round((1 - p.price / p.original_price) * 100) : 0;
  const out = p.stock < 1;
  return (<div className="wrap py-10 grid md:grid-cols-2 gap-10">
    <div>
      <div className="aspect-[4/5] bg-white/5 border border-gold/20 grid place-items-center overflow-hidden">
        {p.images[img] ? <img src={p.images[img]} alt={p.name} className="h-full w-full object-cover" /> : <img src="/logo.png" alt="" className="w-1/2 opacity-30" />}</div>
      {p.images.length > 1 && <div className="flex gap-2 mt-3 overflow-x-auto">{p.images.map((u, i) => <button key={u} onClick={() => setImg(i)} className={`h-16 w-16 shrink-0 border ${i === img ? 'border-gold' : 'border-gold/20'}`}><img src={u} alt="" className="h-full w-full object-cover" /></button>)}</div>}
    </div>
    <div>
      <h1 className="text-3xl sm:text-4xl text-gold">{p.name}</h1>
      <div className="mt-4 flex items-baseline gap-3"><span className="text-2xl font-semibold">{money(p.price)}</span>
        {off > 0 && <><span className="text-muted line-through">{money(p.original_price!)}</span><span className="bg-blush text-ink text-xs font-semibold px-2 py-1">{off}% OFF</span></>}</div>
      <p className="mt-6 text-muted whitespace-pre-line">{p.description}</p>
      <p className={`mt-4 text-sm ${out ? 'text-blush tracking-widest' : 'text-muted'}`}>{out ? 'OUT OF STOCK' : `${p.stock} available`}</p>
      {!out && <div className="mt-6 flex items-center gap-3"><span className="text-xs tracking-widest">QTY</span>
        <button className="btn-ghost !px-4 !py-2" aria-label="Decrease" onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span className="w-8 text-center">{qty}</span>
        <button className="btn-ghost !px-4 !py-2" aria-label="Increase" onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button></div>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button className="btn" disabled={out} onClick={() => add(p, qty)}>Add to Cart</button>
        <button className="btn-ghost" disabled={out} onClick={() => { if (add(p, qty)) nav('/checkout'); }}>Buy Now</button>
      </div>
      <a className="btn-ghost w-full mt-3" target="_blank" rel="noreferrer" href={waLink(`Hello, I am interested in ${p.name}. Please provide more details.`)}>Ask on WhatsApp</a>
    </div></div>);
}

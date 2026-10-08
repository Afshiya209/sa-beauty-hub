import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useCart, money } from '../lib/cart';
import { getSettings } from '../lib/data';
import { Empty, useAsync } from '../components/ui';

export default function Cart() {
  const { lines, setQty, remove, subtotal } = useCart();
  const s = useAsync(getSettings, []);
  const fee = Number(s.data?.delivery_charge ?? 0);
  if (!lines.length) return <div className="wrap"><Empty msg="Your cart is empty." /><div className="text-center"><Link to="/shop" className="btn">Continue Shopping</Link></div></div>;
  return (<div className="wrap py-10 grid lg:grid-cols-3 gap-10">
    <div className="lg:col-span-2 space-y-4"><h1 className="text-4xl text-gold mb-4">Your Cart</h1>
      {lines.map((l: any) => <div key={l.id} className="flex gap-4 border border-gold/20 p-3">
        <div className="h-24 w-20 bg-white/5 shrink-0">{l.image && <img src={l.image} alt={l.name} className="h-full w-full object-cover" />}</div>
        <div className="flex-1"><Link to={`/product/${l.slug}`} className="font-serif">{l.name}</Link><p className="text-gold">{money(l.price)}</p>
          <div className="mt-2 flex items-center gap-2"><button className="btn-ghost !px-3 !py-1" aria-label="Decrease" onClick={() => setQty(l.id, l.qty - 1)}>−</button><span>{l.qty}</span>
            <button className="btn-ghost !px-3 !py-1" aria-label="Increase" onClick={() => setQty(l.id, l.qty + 1)}>+</button>
            <button className="ml-auto text-blush" aria-label="Remove" onClick={() => remove(l.id)}><Trash2 size={18} /></button></div></div></div>)}</div>
    <aside className="border border-gold/30 p-6 h-fit space-y-3">
      <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
      <div className="flex justify-between"><span>Delivery</span><span>{money(fee)}</span></div>
      <div className="flex justify-between text-gold text-lg border-t border-gold/20 pt-3"><span>Total</span><span>{money(subtotal + fee)}</span></div>
      <p className="text-xs text-muted">Payment: Cash on Delivery</p>
      <Link to="/checkout" className="btn w-full">Checkout</Link></aside></div>);
}

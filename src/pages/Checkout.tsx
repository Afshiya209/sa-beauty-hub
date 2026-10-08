import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useCart, money } from '../lib/cart';
import { getSettings } from '../lib/data';
import { useAuth } from '../lib/auth';
import { AuthForm } from './Account';
import { Empty, Loading, useAsync } from '../components/ui';

export default function Checkout() {
  const { lines, subtotal, clear } = useCart(); const nav = useNavigate();
  const s = useAsync(getSettings, []); const fee = Number(s.data?.delivery_charge ?? 0);
  const [busy, setBusy] = useState(false); const key = useRef(crypto.randomUUID());
  const [f, setF] = useState({ name: '', phone: '', email: '', address: '', city: '', state: '', pincode: '' });
  const { user, loading } = useAuth();
  useEffect(() => { if (!user) return; supabase.from('profiles').select('full_name,phone,email').eq('id', user.id).single().then(({ data }) => {
    if (data) setF(x => ({ ...x, name: x.name || data.full_name || '', phone: x.phone || data.phone || '', email: x.email || data.email || '' })); }); }, [user]);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  if (!lines.length) return <div className="wrap"><Empty msg="Your cart is empty." /><div className="text-center"><Link to="/shop" className="btn">Shop</Link></div></div>;
  if (loading) return <Loading />;
  if (!user) return <div><p className="text-center text-muted pt-10 px-4">Please log in or create an account to place your order. Your cart will be saved.</p><AuthForm /></div>;
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (busy) return;
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, '').slice(-10))) return toast.error('Enter a valid 10-digit mobile number');
    if (!/^\d{6}$/.test(f.pincode)) return toast.error('Enter a valid 6-digit pincode');
    setBusy(true);
    const { data, error } = await supabase.rpc('place_order', {
      p_items: lines.map((l: any) => ({ product_id: l.id, quantity: l.qty })),
      p_name: f.name, p_phone: f.phone, p_email: f.email, p_address: f.address, p_city: f.city, p_state: f.state, p_pincode: f.pincode, p_request_key: key.current });
    if (error) { setBusy(false); return toast.error(error.message.includes('fetch') ? 'Network problem. Please try again.' : error.message); }
    clear(); toast.success('Order placed successfully.'); nav('/order-success', { state: { number: data.order_number, total: data.total } });
  };
  const field = (k: string, label: string, props: any = {}) => <label className="block text-xs tracking-widest">{label}<input className="input mt-1 normal-case tracking-normal" value={(f as any)[k]} onChange={set(k)} {...props} /></label>;
  return (<form onSubmit={submit} className="wrap py-10 grid lg:grid-cols-3 gap-10">
    <div className="lg:col-span-2 space-y-4"><h1 className="text-4xl text-gold">Checkout</h1>
      {field('name', 'FULL NAME', { required: true, autoComplete: 'name' })}
      {field('phone', 'MOBILE NUMBER', { required: true, inputMode: 'tel', autoComplete: 'tel' })}
      {field('email', 'EMAIL (OPTIONAL)', { type: 'email', autoComplete: 'email' })}
      {field('address', 'COMPLETE ADDRESS', { required: true, autoComplete: 'street-address' })}
      <div className="grid sm:grid-cols-3 gap-4">{field('city', 'CITY', { required: true })}{field('state', 'STATE', { required: true })}{field('pincode', 'PINCODE', { required: true, inputMode: 'numeric', maxLength: 6 })}</div></div>
    <aside className="border border-gold/30 p-6 h-fit space-y-3">
      {lines.map((l: any) => <div key={l.id} className="flex justify-between text-sm"><span>{l.name} × {l.qty}</span><span>{money(l.price * l.qty)}</span></div>)}
      <div className="flex justify-between border-t border-gold/20 pt-3"><span>Subtotal</span><span>{money(subtotal)}</span></div>
      <div className="flex justify-between"><span>Delivery</span><span>{money(fee)}</span></div>
      <div className="flex justify-between text-gold text-lg"><span>Total</span><span>{money(subtotal + fee)}</span></div>
      <div className="border border-gold/40 p-3 text-sm"><b className="text-gold">CASH ON DELIVERY</b><br />Pay when your order is delivered.</div>
      <button className="btn w-full" disabled={busy}>{busy ? 'Placing order…' : 'Place COD Order'}</button></aside></form>);
}

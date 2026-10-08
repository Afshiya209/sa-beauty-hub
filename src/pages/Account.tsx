import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { money } from '../lib/cart';
import { Loading } from '../components/ui';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const label = (s: string) => s.replace(/_/g, ' ');

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login'); const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: '', phone: '', email: '', password: '' });
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
      if (error) toast.error(error.message); else toast.success('Welcome back!');
    } else {
      const { data, error } = await supabase.auth.signUp({ email: f.email, password: f.password, options: { data: { full_name: f.name, phone: f.phone } } });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success('Account created. Please check your email to confirm, then log in.');
      else toast.success('Account created!');
    }
    setBusy(false); };
  return (<form onSubmit={submit} className="max-w-sm mx-auto py-14 px-4 space-y-4">
    <h1 className="text-3xl text-gold text-center">{mode === 'login' ? 'Login' : 'Create Account'}</h1>
    {mode === 'register' && <><input className="input" placeholder="Full name" required value={f.name} onChange={set('name')} autoComplete="name" />
      <input className="input" placeholder="Mobile number" required inputMode="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /></>}
    <input className="input" type="email" placeholder="Email" required value={f.email} onChange={set('email')} autoComplete="email" />
    <input className="input" type="password" placeholder="Password (min 6 characters)" required minLength={6} value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
    <button className="btn w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}</button>
    <button type="button" className="text-sm text-muted w-full hover:text-gold" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
      {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Login'}</button></form>);
}

function Progress({ status }: { status: string }) {
  if (status === 'cancelled') return <p className="text-blush tracking-widest text-xs mt-3">CANCELLED</p>;
  const idx = STEPS.indexOf(status);
  return (<div className="mt-4 overflow-x-auto"><div className="flex items-start min-w-[420px]">
    {STEPS.map((s, i) => (<div key={s} className="flex-1 text-center">
      <div className="flex items-center"><div className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : i <= idx ? 'bg-gold' : 'bg-gold/20'}`} />
        <div className={`h-4 w-4 rounded-full border ${i <= idx ? 'bg-gold border-gold' : 'border-gold/30'}`} />
        <div className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? 'opacity-0' : i < idx ? 'bg-gold' : 'bg-gold/20'}`} /></div>
      <p className={`mt-2 text-[10px] uppercase tracking-wider ${i <= idx ? 'text-gold' : 'text-muted'}`}>{label(s)}</p></div>))}</div></div>);
}

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null); const [orders, setOrders] = useState<any[] | null>(null); const [saving, setSaving] = useState(false);
  useEffect(() => { if (!user) return; (async () => {
    setProfile((await supabase.from('profiles').select('*').eq('id', user.id).single()).data);
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) toast.error('Could not load your orders.'); setOrders(data || []);
  })(); }, [user]);
  if (loading) return <Loading />;
  if (!user) return <AuthForm />;
  const save = async (e: FormEvent) => { e.preventDefault(); setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: profile.full_name, phone: profile.phone }).eq('id', user.id);
    setSaving(false); error ? toast.error(error.message) : toast.success('Profile updated successfully.'); };
  return (<div className="wrap py-10 max-w-3xl">
    <div className="flex justify-between items-center mb-6"><h1 className="text-4xl text-gold">My Account</h1><button className="btn-ghost" onClick={signOut}>Logout</button></div>
    {profile && <form onSubmit={save} className="border border-gold/30 p-5 grid sm:grid-cols-3 gap-3 items-end">
      <label className="text-xs tracking-widest">NAME<input className="input mt-1" value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></label>
      <label className="text-xs tracking-widest">PHONE<input className="input mt-1" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></label>
      <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      <p className="sm:col-span-3 text-sm text-muted">Email: {profile.email}</p></form>}
    <h2 className="text-2xl text-gold mt-10 mb-4">My Orders</h2>
    {!orders ? <Loading /> : !orders.length ? <div className="text-center py-10 text-muted">No orders yet.<br /><Link to="/shop" className="btn mt-4">Start Shopping</Link></div> :
      <div className="space-y-4">{orders.map(o => <div key={o.id} className="border border-gold/20 p-4">
        <div className="flex justify-between flex-wrap gap-2"><b className="text-gold">#{o.order_number}</b><span className="text-sm text-muted">{new Date(o.created_at).toLocaleDateString()}</span></div>
        <div className="mt-2 text-sm space-y-1">{o.order_items.map((i: any) => <p key={i.id}>{i.product_name} × {i.quantity}</p>)}</div>
        <p className="mt-2">Total: <b className="text-gold">{money(o.total)}</b> <span className="text-xs text-muted">(Cash on Delivery)</span></p>
        <Progress status={o.status} /></div>)}</div>}
  </div>);
}

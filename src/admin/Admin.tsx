import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { money } from '../lib/cart';
import { Loading } from '../components/ui';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const Shell = ({ children }: any) => <div className="min-h-screen bg-ink text-white">{children}</div>;

function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const go = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password }); setBusy(false);
    if (error) toast.error(error.message); };
  return <Shell><form onSubmit={go} className="max-w-sm mx-auto pt-24 px-4 space-y-4 text-center">
    <img src="/logo.png" alt="" className="h-24 mx-auto" /><h1 className="text-2xl text-gold">Admin Login</h1>
    <input className="input" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
    <input className="input" type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
    <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></Shell>;
}

function Dashboard() {
  const [s, setS] = useState<any>(null);
  useEffect(() => { (async () => {
    const { data: o } = await supabase.from('orders').select('status,total'); const { data: p } = await supabase.from('products').select('stock');
    const c = (st: string) => (o || []).filter((x: any) => x.status === st).length;
    setS({ total: o?.length || 0, pending: c('pending'), confirmed: c('confirmed'), delivered: c('delivered'), cancelled: c('cancelled'),
      sales: (o || []).filter((x: any) => x.status !== 'cancelled').reduce((a: number, x: any) => a + Number(x.total), 0), products: p?.length || 0, low: (p || []).filter((x: any) => x.stock <= 5).length });
  })(); }, []);
  if (!s) return <Loading />;
  const cards = [['Total Orders', s.total], ['Pending', s.pending], ['Confirmed', s.confirmed], ['Delivered', s.delivered], ['Cancelled', s.cancelled], ['Total Sales', money(s.sales)], ['Products', s.products], ['Low Stock (≤5)', s.low]];
  return <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{cards.map(([t, v]) => <div key={t as string} className="border border-gold/30 p-5"><p className="text-xs text-muted tracking-widest">{t}</p><p className="text-2xl text-gold mt-2 font-serif">{v}</p></div>)}</div>;
}

const L = ({ t, children }: any) => <label className="block text-xs tracking-widest">{t}{children}</label>;

function ProductForm({ p, cats, onClose, onSaved }: any) {
  const [f, setF] = useState<any>({ name: '', slug: '', description: '', category_id: '', price: '', original_price: '', stock: 0, sku: '', images: [], featured: false, new_arrival: true, sale: false, active: true, ...p });
  const [busy, setBusy] = useState(false); const [up, setUp] = useState(false);
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  const upload = async (files: FileList | null) => {
    if (!files?.length) return; setUp(true); const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) { toast.error(error.message); continue; }
      urls.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
    }
    setF((x: any) => ({ ...x, images: [...x.images, ...urls] })); setUp(false);
  };
  const save = async (e: FormEvent) => { e.preventDefault(); setBusy(true);
    const row = { name: f.name, slug: f.slug || slugify(f.name), description: f.description, category_id: f.category_id || null, price: Number(f.price),
      original_price: f.original_price === '' || f.original_price == null ? null : Number(f.original_price), stock: Number(f.stock), sku: f.sku || null,
      images: f.images, featured: f.featured, new_arrival: f.new_arrival, sale: f.sale, active: f.active };
    const { error } = f.id ? await supabase.from('products').update(row).eq('id', f.id) : await supabase.from('products').insert(row);
    setBusy(false); if (error) return toast.error(error.message);
    toast.success(f.id ? 'Product updated successfully.' : 'Product added successfully.'); onSaved(); };
  return <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto p-4"><form onSubmit={save} className="max-w-2xl mx-auto bg-ink border border-gold/40 p-5 space-y-3">
    <h2 className="text-xl text-gold">{f.id ? 'Edit' : 'Add'} Product</h2>
    <L t="NAME"><input className="input mt-1" required value={f.name} onChange={e => set('name', e.target.value)} /></L>
    <L t="SLUG (web address, auto if empty)"><input className="input mt-1" value={f.slug} onChange={e => set('slug', slugify(e.target.value))} /></L>
    <L t="DESCRIPTION"><textarea className="input mt-1" rows={3} value={f.description || ''} onChange={e => set('description', e.target.value)} /></L>
    <L t="CATEGORY"><select className="input mt-1 bg-ink" value={f.category_id || ''} onChange={e => set('category_id', e.target.value)}><option value="">None</option>{cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></L>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <L t="PRICE ₹"><input className="input mt-1" type="number" min="0" required value={f.price} onChange={e => set('price', e.target.value)} /></L>
      <L t="ORIGINAL ₹"><input className="input mt-1" type="number" min="0" value={f.original_price ?? ''} onChange={e => set('original_price', e.target.value)} /></L>
      <L t="STOCK"><input className="input mt-1" type="number" min="0" required value={f.stock} onChange={e => set('stock', e.target.value)} /></L>
      <L t="SKU"><input className="input mt-1" value={f.sku || ''} onChange={e => set('sku', e.target.value)} /></L></div>
    <div className="flex flex-wrap gap-4 text-sm">{[['featured', 'Featured'], ['new_arrival', 'New arrival'], ['sale', 'Sale'], ['active', 'Active (visible)']].map(([k, t]) =>
      <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={f[k]} onChange={e => set(k, e.target.checked)} />{t}</label>)}</div>
    <L t="PHOTOS (first one is the main photo)"><input className="mt-1 block text-sm" type="file" accept="image/*" multiple onChange={e => upload(e.target.files)} /></L>
    {up && <p className="text-gold text-sm">Uploading…</p>}
    <div className="flex gap-2 flex-wrap">{f.images.map((u: string) => <div key={u} className="relative"><img src={u} alt="" className="h-20 w-16 object-cover" />
      <button type="button" aria-label="Remove photo" className="absolute top-0 right-0 bg-black text-blush px-1" onClick={() => set('images', f.images.filter((x: string) => x !== u))}>×</button></div>)}</div>
    <div className="flex gap-3 pt-2"><button className="btn" disabled={busy || up}>{busy ? 'Saving…' : 'Save'}</button><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button></div></form></div>;
}

function Products() {
  const [rows, setRows] = useState<any[] | null>(null); const [cats, setCats] = useState<any[]>([]); const [q, setQ] = useState(''); const [edit, setEdit] = useState<any>(null);
  const load = async () => { const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }); if (error) toast.error(error.message); setRows(data || []);
    setCats((await supabase.from('categories').select('*').order('name')).data || []); };
  useEffect(() => { load(); }, []);
  const del = async (p: any) => { if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id); if (error) return toast.error(error.message); toast.success('Product deleted successfully.'); load(); };
  if (!rows) return <Loading />;
  const list = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));
  return <div><div className="flex gap-3 mb-4"><input className="input" placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)} /><button className="btn whitespace-nowrap" onClick={() => setEdit({})}>+ Add</button></div>
    {!list.length && <p className="text-muted py-10 text-center">No products found.</p>}
    <div className="space-y-2">{list.map(p => <div key={p.id} className="flex items-center gap-3 border border-gold/20 p-2">
      <div className="h-14 w-12 bg-white/5 shrink-0">{p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}</div>
      <div className="flex-1 min-w-0"><p className="truncate">{p.name} {!p.active && <span className="text-blush text-xs">(hidden)</span>}</p><p className="text-xs text-muted">{money(p.price)} · Stock {p.stock}</p></div>
      <button className="btn-ghost !px-3 !py-2" onClick={() => setEdit(p)}>Edit</button><button className="btn-ghost !px-3 !py-2 !text-blush" onClick={() => del(p)}>Delete</button></div>)}</div>
    {edit && <ProductForm p={edit} cats={cats} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}</div>;
}

function Orders() {
  const [rows, setRows] = useState<any[] | null>(null); const [open, setOpen] = useState<string | null>(null);
  const load = async () => { const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }); if (error) toast.error(error.message); setRows(data || []); };
  useEffect(() => { load(); }, []);
  const setStatus = async (id: string, status: string) => { const { error } = await supabase.from('orders').update({ status }).eq('id', id); if (error) return toast.error(error.message); toast.success('Status updated.'); load(); };
  if (!rows) return <Loading />; if (!rows.length) return <p className="text-muted py-10 text-center">No orders yet.</p>;
  return <div className="space-y-2">{rows.map(o => { const ph = o.customer_phone.replace(/\D/g, '').slice(-10);
    return <div key={o.id} className="border border-gold/20 p-3">
      <div className="flex flex-wrap items-center gap-3 justify-between"><button className="text-left" onClick={() => setOpen(open === o.id ? null : o.id)}>
        <b className="text-gold">#{o.order_number}</b> · {o.customer_name} · {money(o.total)}<br /><span className="text-xs text-muted">{new Date(o.created_at).toLocaleString()} · COD · {o.customer_phone}</span></button>
        <select className="input !w-auto bg-ink !py-2" value={o.status} onChange={e => setStatus(o.id, e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
      {open === o.id && <div className="mt-3 text-sm space-y-1 border-t border-gold/20 pt-3">
        <p>{o.address}, {o.city}, {o.state} - {o.pincode}</p>{o.customer_email && <p>{o.customer_email}</p>}
        {o.order_items.map((i: any) => <p key={i.id}>{i.product_name} × {i.quantity} — {money(i.subtotal)}</p>)}
        <p>Subtotal {money(o.subtotal)} · Delivery {money(o.delivery_fee)} · <b className="text-gold">Total {money(o.total)}</b></p>
        <div className="flex gap-2 pt-2 flex-wrap"><a className="btn-ghost !py-2" target="_blank" rel="noreferrer" href={`https://wa.me/91${ph}?text=${encodeURIComponent(`Hello ${o.customer_name}, this is SA Beauty Care & Fashion Hub regarding your order #${o.order_number}.`)}`}>WhatsApp customer</a>
          <button className="btn-ghost !py-2" onClick={() => setStatus(o.id, 'delivered')}>Mark delivered</button>
          <button className="btn-ghost !py-2 !text-blush" onClick={() => confirm('Cancel this order?') && setStatus(o.id, 'cancelled')}>Cancel order</button></div></div>}</div>; })}</div>;
}


function Settings() {
  const [f, setF] = useState<any>(null); const [busy, setBusy] = useState(false); const [up, setUp] = useState(false);
  useEffect(() => { supabase.from('settings').select('*').eq('id', 1).single().then(({ data, error }) => { if (error) toast.error(error.message); setF(data || {}); }); }, []);
  if (!f) return <Loading />;
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  const logo = async (file?: File) => { if (!file) return; setUp(true);
    const path = `logo-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    setUp(false); if (error) return toast.error(error.message);
    set('logo_url', supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl); };
  const save = async (e: FormEvent) => { e.preventDefault();
    let wa = String(f.whatsapp_number || '').replace(/\D/g, ''); if (wa.length === 10) wa = '91' + wa;
    if (wa.length < 11) return toast.error('Enter a valid WhatsApp number, e.g. 916305967665');
    if (Number(f.delivery_charge) < 0 || Number(f.min_order_value) < 0) return toast.error('Amounts cannot be negative');
    setBusy(true);
    const { error } = await supabase.from('settings').update({ store_name: f.store_name, whatsapp_number: wa, store_email: f.store_email || null, store_address: f.store_address || null,
      delivery_charge: Number(f.delivery_charge), min_order_value: Number(f.min_order_value), instagram: f.instagram || null, facebook: f.facebook || null, youtube: f.youtube || null, logo_url: f.logo_url || null }).eq('id', 1);
    setBusy(false); if (error) return toast.error(error.message); setF({ ...f, whatsapp_number: wa }); toast.success('Settings saved successfully.'); };
  const T = ({ k, t, ...rest }: any) => <label className="block text-xs tracking-widest">{t}<input className="input mt-1 normal-case tracking-normal" value={f[k] ?? ''} onChange={e => set(k, e.target.value)} {...rest} /></label>;
  return <form onSubmit={save} className="max-w-2xl space-y-4">
    <T k="store_name" t="STORE NAME" required />
    <T k="whatsapp_number" t="WHATSAPP NUMBER (with country code, e.g. 916305967665)" required inputMode="tel" />
    <T k="store_email" t="STORE EMAIL" type="email" />
    <label className="block text-xs tracking-widest">STORE ADDRESS<textarea className="input mt-1 normal-case tracking-normal" rows={2} value={f.store_address ?? ''} onChange={e => set('store_address', e.target.value)} /></label>
    <div className="grid grid-cols-2 gap-3"><T k="delivery_charge" t="DELIVERY CHARGE ₹" type="number" min="0" required /><T k="min_order_value" t="MINIMUM ORDER ₹" type="number" min="0" required /></div>
    <T k="instagram" t="INSTAGRAM LINK" /><T k="facebook" t="FACEBOOK LINK" /><T k="youtube" t="YOUTUBE LINK" />
    <label className="block text-xs tracking-widest">STORE LOGO<input className="mt-1 block text-sm" type="file" accept="image/*" onChange={e => logo(e.target.files?.[0])} /></label>
    {up && <p className="text-gold text-sm">Uploading…</p>}{f.logo_url && <img src={f.logo_url} alt="Logo" className="h-20" />}
    <button className="btn" disabled={busy || up}>{busy ? 'Saving…' : 'Save settings'}</button></form>;
}

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth(); const [tab, setTab] = useState('dashboard');
  if (loading) return <Shell><Loading /></Shell>;
  if (!user) return <Login />;
  if (!isAdmin) return <Shell><div className="text-center pt-32 space-y-4"><p>Access denied. This account is not an admin.</p><button className="btn" onClick={signOut}>Log out</button></div></Shell>;
  return <Shell><header className="border-b border-gold/30 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
    <div className="flex items-center gap-3"><img src="/logo.png" alt="" className="h-10" /><b className="text-gold font-serif">Admin</b></div>
    <nav className="flex gap-2 text-xs tracking-widest uppercase">{['dashboard', 'orders', 'products', 'settings'].map(t => <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 border ${tab === t ? 'border-gold text-gold' : 'border-gold/20'}`}>{t}</button>)}
      <a className="px-3 py-2 border border-gold/20" href="/">Storefront</a><button className="px-3 py-2 border border-gold/20 text-blush" onClick={signOut}>Logout</button></nav></header>
    <div className="max-w-5xl mx-auto p-4 pt-6">{tab === 'dashboard' ? <Dashboard /> : tab === 'orders' ? <Orders /> : tab === 'settings' ? <Settings /> : <Products />}</div></Shell>;
}

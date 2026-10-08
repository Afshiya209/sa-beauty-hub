import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X, MessageCircle, User } from 'lucide-react';
import { useCart } from '../lib/cart';
import { waLink, WHATSAPP_NUMBER, setWhatsapp } from '../lib/supabase';
import { getSettings } from '../lib/data';

const links = [['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About'], ['/contact', 'Contact']];
export default function Layout() {
  const { count } = useCart(); const [open, setOpen] = useState(false); const nav = useNavigate();
  const [num, setNum] = useState(WHATSAPP_NUMBER);
  useEffect(() => { getSettings().then(st => { if (st?.whatsapp_number) { setWhatsapp(st.whatsapp_number); setNum(st.whatsapp_number); } }); }, []);
  const wa = waLink('Hello SA Beauty Care & Fashion Hub, I need help with my order.');
  return (<>
    <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-gold/30">
      <div className="wrap flex items-center justify-between h-16">
        <Link to="/"><img src="/logo.png" alt="SA Beauty Care and Fashion Hub" className="h-12 w-12" /></Link>
        <nav className="hidden md:flex gap-8 text-xs tracking-[.2em] uppercase">
          {links.map(([to, t]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'text-gold' : 'hover:text-gold'}>{t}</NavLink>)}
        </nav>
        <div className="flex items-center gap-4">
          <button aria-label="Search" onClick={() => nav('/shop')}><Search size={20} /></button>
          <Link to="/account" aria-label="My account"><User size={20} /></Link>
          <Link to="/cart" aria-label="Cart" className="relative"><ShoppingBag size={20} />
            {count > 0 && <span className="absolute -top-2 -right-2 bg-gold text-ink text-[10px] font-bold h-4 min-w-4 px-1 grid place-items-center rounded-full">{count}</span>}</Link>
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <nav className="md:hidden border-t border-gold/20 px-4 py-4 flex flex-col gap-4 text-xs tracking-[.2em] uppercase">
        {links.map(([to, t]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{t}</Link>)}</nav>}
    </header>
    <main className="min-h-[70vh]"><Outlet /></main>
    <footer className="border-t border-gold/30 mt-20 py-12 text-center">
      <img src="/logo.png" alt="" className="h-24 w-24 mx-auto" />
      <p className="font-serif text-gold mt-3">SA BEAUTY CARE AND FASHION HUB</p>
      <p className="text-muted text-xs tracking-[.3em] mt-1">BEAUTY • FASHION • CONFIDENCE</p>
      <p className="mt-4 text-sm"><a className="hover:text-gold" href={wa}>WhatsApp: +{num.slice(0, 2)} {num.slice(2)}</a></p>
      <p className="text-muted text-xs mt-6">© {new Date().getFullYear()} SA Beauty Care and Fashion Hub. Cash on Delivery available across India.</p>
    </footer>
    <a href={wa} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 right-5 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition"><MessageCircle /></a>
  </>);
}

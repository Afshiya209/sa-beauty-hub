import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Youtube, Menu, Search, ShoppingBag, User, X, MessageCircle } from 'lucide-react';
import { useCart } from '../lib/cart';
import { waLink, WHATSAPP_NUMBER, setWhatsapp } from '../lib/supabase';
import { getSettings } from '../lib/data';

const links = [['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About'], ['/contact', 'Contact']];
export default function Layout() {
  const { count } = useCart(); const [open, setOpen] = useState(false); const nav = useNavigate(); const { pathname } = useLocation();
  const [st, setSt] = useState<any>(null); const num = st?.whatsapp_number || WHATSAPP_NUMBER;
  useEffect(() => { getSettings().then(s => { if (s?.whatsapp_number) setWhatsapp(s.whatsapp_number); setSt(s); }); }, []);
  useEffect(() => { window.scrollTo(0, 0); setOpen(false); }, [pathname]);
  const wa = waLink('Hello SA Beauty Care & Fashion Hub, I need help with my order.');
  const social = [[st?.instagram, Instagram, 'Instagram'], [st?.facebook, Facebook, 'Facebook'], [st?.youtube, Youtube, 'YouTube']].filter(x => x[0]) as any[];
  return (<>
    <div className="bg-gold text-ink text-[11px] sm:text-xs tracking-[.15em] text-center py-2 px-2 font-medium">CASH ON DELIVERY AVAILABLE • SUPPORT ON WHATSAPP</div>
    <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-gold/30">
      <div className="wrap flex items-center justify-between h-16">
        <Link to="/"><img src="/logo.png" alt="SA Beauty Care and Fashion Hub" className="h-12 w-12" /></Link>
        <nav className="hidden md:flex gap-8 text-xs tracking-[.2em] uppercase">
          {links.map(([to, t]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'text-gold' : 'hover:text-gold'}>{t}</NavLink>)}</nav>
        <div className="flex items-center gap-4">
          <button aria-label="Search" onClick={() => nav('/shop')}><Search size={20} /></button>
          <Link to="/account" aria-label="My account"><User size={20} /></Link>
          <Link to="/cart" aria-label="Cart" className="relative"><ShoppingBag size={20} />
            {count > 0 && <span className="absolute -top-2 -right-2 bg-gold text-ink text-[10px] font-bold h-4 min-w-4 px-1 grid place-items-center rounded-full">{count}</span>}</Link>
          <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></div>
      {open && <nav className="md:hidden border-t border-gold/20 px-4 py-2 flex flex-col text-sm tracking-[.2em] uppercase">
        {[...links, ['/account', 'My Account']].map(([to, t]) => <Link key={to} to={to} className="py-3 border-b border-gold/10">{t}</Link>)}</nav>}
    </header>
    <motion.main key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }} className="min-h-[70vh]"><Outlet /></motion.main>
    <footer className="border-t border-gold/30 mt-20 pt-12 pb-8">
      <div className="wrap grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1"><img src="/logo.png" alt="" className="h-20 w-20" />
          <p className="font-serif text-gold mt-3">SA BEAUTY CARE AND FASHION HUB</p><p className="text-muted text-[11px] tracking-[.25em] mt-1">BEAUTY • FASHION • CONFIDENCE</p></div>
        <div><h3 className="text-gold mb-3">Quick Links</h3><ul className="space-y-2 text-muted">{[['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About'], ['/contact', 'Contact'], ['/account', 'My Account']].map(([to, t]) => <li key={to}><Link className="hover:text-gold" to={to}>{t}</Link></li>)}</ul></div>
        <div><h3 className="text-gold mb-3">Customer Support</h3><ul className="space-y-2 text-muted">
          <li><a className="hover:text-gold" href={wa} target="_blank" rel="noreferrer">WhatsApp</a></li>
          {[['/shipping', 'Shipping'], ['/returns', 'Returns'], ['/privacy', 'Privacy'], ['/terms', 'Terms']].map(([to, t]) => <li key={to}><Link className="hover:text-gold" to={to}>{t}</Link></li>)}</ul></div>
        <div className="col-span-2 md:col-span-1"><h3 className="text-gold mb-3">Contact</h3><div className="space-y-2 text-muted">
          <p><a className="hover:text-gold" href={wa} target="_blank" rel="noreferrer">WhatsApp: +{num.slice(0, 2)} {num.slice(2)}</a></p>
          {st?.store_email && <p>{st.store_email}</p>}{st?.store_address && <p>{st.store_address}</p>}
          {!!social.length && <div className="flex gap-4 pt-2">{social.map(([url, Icon, n]) => <a key={n} href={url} target="_blank" rel="noreferrer" aria-label={n} className="hover:text-gold"><Icon size={20} /></a>)}</div>}</div></div></div>
      <p className="text-center text-muted text-xs mt-10 px-4">© {new Date().getFullYear()} SA Beauty Care and Fashion Hub. Cash on Delivery available across India.</p>
    </footer>
    <a href={wa} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className={`fixed right-4 sm:right-5 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:scale-110 transition md:bottom-5 ${pathname.startsWith('/product/') ? 'bottom-24' : 'bottom-5'}`}><MessageCircle /></a>
  </>);
}

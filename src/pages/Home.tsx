import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Sparkles, Headphones, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { listProducts } from '../lib/data';
import ProductCard from '../components/ProductCard';
import { Loading, useAsync } from '../components/ui';

const Reveal = ({ children }: { children: ReactNode }) => <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: .5 }}>{children}</motion.div>;
const Title = ({ children }: { children: ReactNode }) => <div className="text-center mb-8"><h2 className="text-2xl sm:text-3xl text-gold">{children}</h2><div className="mx-auto mt-3 h-px w-16 bg-gold/60" /></div>;
const why = [[ShieldCheck, 'Quality Products', 'Authentic, carefully checked.'], [Truck, 'Easy COD Ordering', 'Pay when it arrives.'], [Sparkles, 'Curated Collection', 'Beauty and fashion we love.'], [Headphones, 'Customer Support', 'Quick help on WhatsApp.'], [Lock, 'Secure Ordering', 'Your details stay private.']] as any[];

function Grid({ title, filter }: { title: string; filter: any }) {
  const { data, loading } = useAsync(() => listProducts({ ...filter, limit: 8 }), []);
  if (loading) return <Loading />;
  if (!data?.length) return null;
  return <section className="wrap mt-16 sm:mt-20"><Reveal><Title>{title}</Title>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">{data.map(p => <ProductCard key={p.id} p={p} />)}</div>
    <div className="text-center mt-8"><Link to="/shop" className="btn-ghost">View all</Link></div></Reveal></section>;
}
export default function Home() {
  const cats = useAsync(async () => (await supabase.from('categories').select('*').eq('active', true).order('name')).data || [], []);
  return (<>
    <section className="border-b border-gold/20 bg-[radial-gradient(ellipse_at_top,rgba(212,175,90,.14),transparent_65%)]">
      <div className="wrap py-10 md:py-24 grid md:grid-cols-2 gap-6 md:gap-10 items-center">
        <motion.img initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} src="/logo.png" alt="SA Beauty Care and Fashion Hub logo" className="w-48 sm:w-72 md:w-96 mx-auto md:order-last" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} className="text-center md:text-left">
          <p className="text-blush text-[11px] sm:text-xs tracking-[.35em] mb-3">LUXURY BEAUTY & FASHION</p>
          <h1 className="text-4xl sm:text-6xl leading-tight text-gold">BEAUTY.<br />FASHION.<br />CONFIDENCE.</h1>
          <p className="mt-5 text-muted max-w-md mx-auto md:mx-0">Discover beauty essentials and fashion pieces curated for your everyday elegance.</p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center md:justify-start"><Link to="/shop" className="btn">Shop Now</Link><Link to="/shop" className="btn-ghost">Explore Collection</Link></div></motion.div></div></section>
    {!!cats.data?.length && <section className="wrap mt-14 sm:mt-16"><Reveal><Title>Shop by Category</Title>
      <div className="flex md:grid md:grid-cols-3 gap-3 sm:gap-5 overflow-x-auto snap-x pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {cats.data.map((c: any) => <Link key={c.id} to={`/shop?category=${c.id}`} className="snap-start shrink-0 min-w-[44%] md:min-w-0 border border-gold/30 hover:border-gold hover:bg-gold/10 transition py-8 sm:py-10 text-center font-serif text-lg sm:text-xl">{c.name}</Link>)}</div></Reveal></section>}
    <Grid title="Featured Products" filter={{ featured: true }} />
    <Grid title="New Arrivals" filter={{ sort: 'new' }} />
    <section className="wrap mt-16 sm:mt-20"><Reveal><Title>Why Shop With Us</Title>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{why.map(([Icon, t, d], i) => <div key={t} className={`border border-gold/20 p-5 text-center ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}><Icon className="mx-auto text-gold" size={24} /><h3 className="text-gold mt-3">{t}</h3><p className="text-muted text-xs mt-2">{d}</p></div>)}</div></Reveal></section>
  </>);
}

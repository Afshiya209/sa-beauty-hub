import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { listProducts } from '../lib/data';
import ProductCard from '../components/ProductCard';
import { Loading, ErrorBox, Empty, useAsync } from '../components/ui';

const why = [['Quality Products', 'Authentic, carefully checked.'], ['Easy COD Ordering', 'Pay when it arrives.'], ['Curated Collection', 'Beauty and fashion we love.'], ['Customer Support', 'Quick help on WhatsApp.'], ['Secure Ordering', 'Your details stay private.']];
function Grid({ title, filter }: { title: string; filter: any }) {
  const { data, loading, error } = useAsync(() => listProducts({ ...filter, limit: 8 }), []);
  return (<section className="wrap mt-20"><h2 className="text-3xl text-center text-gold mb-8">{title}</h2>
    {loading ? <Loading /> : error ? <ErrorBox /> : !data?.length ? <Empty msg="No products found." /> :
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">{data.map(p => <ProductCard key={p.id} p={p} />)}</div>}</section>);
}
export default function Home() {
  const cats = useAsync(async () => (await supabase.from('categories').select('*').eq('active', true).order('name')).data || [], []);
  return (<>
    <section className="relative overflow-hidden border-b border-gold/20">
      <div className="wrap py-16 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
          <p className="text-blush text-xs tracking-[.4em] mb-4">SA BEAUTY CARE AND FASHION HUB</p>
          <h1 className="text-4xl sm:text-6xl leading-tight text-gold">BEAUTY.<br />FASHION.<br />CONFIDENCE.</h1>
          <p className="mt-6 text-muted max-w-md">Discover beauty essentials and fashion pieces curated for your everyday elegance.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/shop" className="btn">Shop Now</Link><Link to="/shop" className="btn-ghost">Explore Collection</Link></div>
        </motion.div>
        <motion.img initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8 }} src="/logo.png" alt="SA Beauty Care and Fashion Hub logo" className="w-64 sm:w-96 mx-auto" />
      </div>
    </section>
    <section className="wrap mt-16"><h2 className="text-3xl text-center text-gold mb-8">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {(cats.data || []).map((c: any) => <Link key={c.id} to={`/shop?category=${c.id}`} className="border border-gold/30 hover:border-gold hover:bg-gold/5 transition py-10 text-center font-serif text-xl">{c.name}</Link>)}</div></section>
    <Grid title="Featured Products" filter={{ featured: true }} />
    <Grid title="New Arrivals" filter={{ sort: 'new' }} />
    <section className="wrap mt-20"><h2 className="text-3xl text-center text-gold mb-8">Why Shop With Us</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{why.map(([t, d]) => <div key={t} className="border border-gold/20 p-5 text-center"><h3 className="text-gold">{t}</h3><p className="text-muted text-xs mt-2">{d}</p></div>)}</div></section>
  </>);
}

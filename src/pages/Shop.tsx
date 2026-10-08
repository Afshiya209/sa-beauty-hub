import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { listProducts } from '../lib/data';
import ProductCard from '../components/ProductCard';
import { Loading, ErrorBox, Empty, useAsync, useDebounced } from '../components/ui';

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [search, setSearch] = useState(''); const q = useDebounced(search);
  const [maxPrice, setMax] = useState(''); const [sort, setSort] = useState('new'); const [sale, setSale] = useState(false);
  const [limit, setLimit] = useState(12);
  const category = sp.get('category') || '';
  const cats = useAsync(async () => (await supabase.from('categories').select('*').eq('active', true).order('name')).data || [], []);
  const { data, loading, error } = useAsync(() => listProducts({ search: q, category, maxPrice: maxPrice ? Number(maxPrice) : undefined, sort, sale, limit }), [q, category, maxPrice, sort, sale, limit]);
  return (<div className="wrap py-10">
    <h1 className="text-4xl text-gold text-center mb-8">Shop</h1>
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
      <input className="input lg:col-span-2" placeholder="Search products…" aria-label="Search" value={search} onChange={e => setSearch(e.target.value)} />
      <select className="input bg-ink" aria-label="Category" value={category} onChange={e => e.target.value ? setSp({ category: e.target.value }) : setSp({})}>
        <option value="">All categories</option>{(cats.data || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <input className="input" type="number" min="0" placeholder="Max price ₹" aria-label="Max price" value={maxPrice} onChange={e => setMax(e.target.value)} />
      <select className="input bg-ink" aria-label="Sort" value={sort} onChange={e => setSort(e.target.value)}>
        <option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="popular">Popular</option></select>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sale} onChange={e => setSale(e.target.checked)} />Sale only</label>
    </div>
    {loading ? <Loading /> : error ? <ErrorBox /> : !data?.length ? <Empty msg="No products found." /> : <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">{data.map(p => <ProductCard key={p.id} p={p} />)}</div>
      {data.length >= limit && <div className="text-center mt-10"><button className="btn-ghost" onClick={() => setLimit(limit + 12)}>Load more</button></div>}</>}
  </div>);
}

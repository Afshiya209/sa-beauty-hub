import { useEffect, useState } from 'react';
export const Loading = () => <div className="py-20 text-center text-gold tracking-widest text-xs animate-pulse">LOADING…</div>;
export const ErrorBox = ({ msg }: { msg?: string }) => <div className="py-20 text-center text-blush">{msg || 'Something went wrong. Please try again.'}</div>;
export const Empty = ({ msg }: { msg: string }) => <div className="py-20 text-center text-muted">{msg}</div>;
export function useAsync<T>(fn: () => Promise<T>, deps: any[]) {
  const [state, set] = useState<{ data?: T; error?: any; loading: boolean }>({ loading: true });
  useEffect(() => { let ok = true; set(s => ({ ...s, loading: true })); fn().then(data => ok && set({ data, loading: false })).catch(error => ok && set({ error, loading: false })); return () => { ok = false; }; }, deps);
  return state;
}
export function useDebounced<T>(v: T, ms = 350) { const [d, s] = useState(v); useEffect(() => { const t = setTimeout(() => s(v), ms); return () => clearTimeout(t); }, [v]); return d; }

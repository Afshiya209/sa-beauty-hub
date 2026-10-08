import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
const Ctx = createContext<any>(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null); const [role, setRole] = useState<string | null>(null); const [loading, setLoading] = useState(true);
  const load = async (u: any) => {
    setUser(u);
    if (!u) { setRole(null); setLoading(false); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', u.id).single();
    setRole(data?.role ?? 'customer'); setLoading(false);
  };
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setTimeout(() => load(s?.user ?? null), 0); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return <Ctx.Provider value={{ user, role, loading, isAdmin: role === 'admin', signOut: () => supabase.auth.signOut() }}>{children}</Ctx.Provider>;
}

import { Link, useLocation } from 'react-router-dom';
import { waLink } from '../lib/supabase';
export const OrderSuccess = () => {
  const { state } = useLocation() as any;
  if (!state) return <div className="wrap py-20 text-center"><Link to="/shop" className="btn">Shop</Link></div>;
  return (<div className="wrap py-20 text-center"><h1 className="text-4xl text-gold">Order placed successfully!</h1>
    <p className="mt-4 text-xl">Your Order ID: #{state.number}</p><p className="text-muted mt-2">Pay ₹{state.total} when your order is delivered.</p>
    <a className="btn mt-8" target="_blank" rel="noreferrer" href={waLink(`Hello SA Beauty Care & Fashion Hub, I placed order #${state.number}.`)}>Contact us on WhatsApp</a></div>);
};
const Page = ({ title, children }: any) => <div className="wrap py-14 max-w-3xl"><h1 className="text-4xl text-gold mb-6">{title}</h1><div className="text-muted space-y-4">{children}</div></div>;
export const About = () => <Page title="About Us"><p>SA Beauty Care and Fashion Hub brings you beauty essentials and fashion pieces curated for everyday elegance.</p></Page>;
export const Contact = () => <Page title="Contact"><p>WhatsApp us on +91 6305967665.</p><a className="btn" href={waLink('Hello SA Beauty Care & Fashion Hub, I need help.')}>Chat on WhatsApp</a></Page>;
export const Policy = ({ title }: { title: string }) => <Page title={title}><p>Please replace this text with your {title.toLowerCase()} before launch.</p></Page>;

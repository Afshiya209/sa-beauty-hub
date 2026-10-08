import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { About, Contact, OrderSuccess, Policy } from './pages/Static';

export default function App() {
  return (<Routes><Route element={<Layout />}>
    <Route path="/" element={<Home />} /><Route path="/shop" element={<Shop />} />
    <Route path="/product/:slug" element={<ProductPage />} /><Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} /><Route path="/order-success" element={<OrderSuccess />} />
    <Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} />
    <Route path="/privacy" element={<Policy title="Privacy Policy" />} /><Route path="/terms" element={<Policy title="Terms & Conditions" />} />
    <Route path="/shipping" element={<Policy title="Shipping & Delivery" />} /><Route path="/returns" element={<Policy title="Return & Refund Policy" />} />
    <Route path="*" element={<Home />} /></Route></Routes>);
}

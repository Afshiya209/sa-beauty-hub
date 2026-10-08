export type Role = 'customer' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Category { id: string; name: string; slug: string; description: string | null; image: string | null; active: boolean; }
export interface Product {
  id: string; name: string; slug: string; description: string | null; category_id: string | null;
  price: number; original_price: number | null; stock: number; sku: string | null; images: string[];
  featured: boolean; new_arrival: boolean; sale: boolean; active: boolean; created_at: string;
}
export interface Order {
  id: string; order_number: string; user_id: string | null; customer_name: string; customer_phone: string;
  customer_email: string | null; address: string; city: string; state: string; pincode: string;
  subtotal: number; delivery_fee: number; total: number; payment_method: 'COD'; status: OrderStatus; created_at: string;
}
export interface CartLine { productId: string; quantity: number; }

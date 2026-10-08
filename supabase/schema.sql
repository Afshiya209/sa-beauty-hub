-- SA Beauty Care and Fashion Hub — run this whole file once in Supabase > SQL Editor.
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, email text, phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, slug text not null unique,
  description text, image text, active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null, slug text not null unique, description text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2) check (original_price is null or original_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  sku text unique, images text[] not null default '{}',
  featured boolean not null default false, new_arrival boolean not null default false,
  sale boolean not null default false, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_active_idx on public.products(active, created_at desc);

create table public.settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'SA Beauty Care and Fashion Hub',
  whatsapp_number text not null default '916305967665',
  store_email text, store_address text, logo_url text,
  delivery_charge numeric(10,2) not null default 60,
  min_order_value numeric(10,2) not null default 0,
  instagram text, facebook text, youtube text
);
insert into public.settings (id) values (1);

create sequence public.order_number_seq start 10482;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  request_key text unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null, customer_phone text not null, customer_email text,
  address text not null, city text not null, state text not null, pincode text not null,
  subtotal numeric(10,2) not null, delivery_fee numeric(10,2) not null, total numeric(10,2) not null,
  payment_method text not null default 'COD' check (payment_method = 'COD'),
  status text not null default 'pending'
    check (status in ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index orders_user_idx on public.orders(user_id, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null, product_image text,
  quantity integer not null check (quantity > 0),
  price numeric(10,2) not null, subtotal numeric(10,2) not null
);
create index order_items_order_idx on public.order_items(order_id);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null, phone text not null, address text not null,
  city text not null, state text not null, pincode text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customers can never promote themselves (SQL Editor has no auth.uid(), so you can set the first admin there).
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Not allowed to change role';
  end if;
  return new;
end $$;
create trigger protect_role_trg before update on public.profiles
  for each row execute function public.protect_role();

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- Safe order placement: stock check + deduction in one transaction, with row locks.
-- p_items example: [{"product_id":"<uuid>","quantity":2}]
create or replace function public.place_order(
  p_items jsonb, p_name text, p_phone text, p_email text,
  p_address text, p_city text, p_state text, p_pincode text, p_request_key text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_existing orders%rowtype; v_settings settings%rowtype; v_item jsonb; v_prod products%rowtype;
  v_qty int; v_subtotal numeric := 0; v_fee numeric; v_order_id uuid; v_number text;
begin
  if p_request_key is not null then
    select * into v_existing from orders where request_key = p_request_key;
    if found then
      return jsonb_build_object('order_id', v_existing.id, 'order_number', v_existing.order_number, 'total', v_existing.total);
    end if;
  end if;
  if coalesce(trim(p_name),'') = '' or coalesce(trim(p_phone),'') = '' or coalesce(trim(p_address),'') = ''
     or coalesce(trim(p_city),'') = '' or coalesce(trim(p_state),'') = '' or coalesce(trim(p_pincode),'') = '' then
    raise exception 'Please fill in all required details.';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Your cart is empty.'; end if;

  select * into v_settings from settings where id = 1;
  v_number := 'SABC-' || nextval('order_number_seq');
  insert into orders (order_number, request_key, user_id, customer_name, customer_phone, customer_email,
                      address, city, state, pincode, subtotal, delivery_fee, total)
  values (v_number, p_request_key, auth.uid(), trim(p_name), trim(p_phone), nullif(trim(p_email),''),
          trim(p_address), trim(p_city), trim(p_state), trim(p_pincode), 0, 0, 0)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;
    if v_qty is null or v_qty < 1 then raise exception 'Invalid quantity.'; end if;
    select * into v_prod from products where id = (v_item->>'product_id')::uuid and active for update;
    if not found then raise exception 'A product in your cart is no longer available.'; end if;
    if v_prod.stock < v_qty then
      raise exception 'Only % left of "%". Please update your cart.', v_prod.stock, v_prod.name;
    end if;
    update products set stock = stock - v_qty where id = v_prod.id;
    insert into order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
    values (v_order_id, v_prod.id, v_prod.name, v_prod.images[1], v_qty, v_prod.price, v_prod.price * v_qty);
    v_subtotal := v_subtotal + v_prod.price * v_qty;
  end loop;

  if v_subtotal < v_settings.min_order_value then
    raise exception 'Minimum order value is ₹%.', v_settings.min_order_value;
  end if;
  v_fee := v_settings.delivery_charge;
  update orders set subtotal = v_subtotal, delivery_fee = v_fee, total = v_subtotal + v_fee where id = v_order_id;
  return jsonb_build_object('order_id', v_order_id, 'order_number', v_number, 'total', v_subtotal + v_fee);
end $$;
grant execute on function public.place_order to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;

create policy "profile read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profile update own or admin" on public.profiles for update using (id = auth.uid() or public.is_admin());
create policy "categories public read active" on public.categories for select using (active or public.is_admin());
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "products public read active" on public.products for select using (active or public.is_admin());
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "settings public read" on public.settings for select using (true);
create policy "settings admin update" on public.settings for update using (public.is_admin());
-- Orders are created ONLY through place_order(); no insert policy exists.
create policy "orders read own or admin" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders admin update" on public.orders for update using (public.is_admin());
create policy "order items read own or admin" on public.order_items for select using (
  public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "addresses own" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
create policy "product images public read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product images admin insert" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin update" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin delete" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- OPTIONAL DEMO DATA (names start with "[DEMO]"; delete from admin later)
insert into public.categories (name, slug) values
 ('Beauty','beauty'),('Skincare','skincare'),('Makeup','makeup'),('Fashion','fashion'),('Accessories','accessories'),('New Arrivals','new-arrivals');
insert into public.products (name, slug, description, category_id, price, original_price, stock, sku, featured, new_arrival, sale)
select v.n, v.s, 'Demo product — delete me.', c.id, v.p, v.op, v.st, v.sku, true, true, v.op is not null
from (values
 ('[DEMO] Luxury Lipstick','demo-luxury-lipstick','makeup',499,699,25,'DEMO-001'),
 ('[DEMO] Face Serum','demo-face-serum','skincare',799,null::int,18,'DEMO-002'),
 ('[DEMO] Designer Handbag','demo-designer-handbag','accessories',1999,2499,8,'DEMO-003'),
 ('[DEMO] Women''s Dress','demo-womens-dress','fashion',1499,1999,12,'DEMO-004'),
 ('[DEMO] Fashion Accessories Set','demo-accessories-set','accessories',349,null::int,30,'DEMO-005')
) as v(n,s,cat,p,op,st,sku) join public.categories c on c.slug = v.cat;

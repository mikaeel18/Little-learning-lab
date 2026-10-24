-- Little Lab Learning: database design (Postgres / Supabase)
-- Run once in Supabase > SQL Editor. NOT yet tested against a live database.
-- Prices are stored in cents (R149.00 = 14900) to avoid rounding errors.

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create function is_admin() returns boolean
language sql security definer set search_path = public stable as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- New sign-ups always become customers. You make yourself admin once, by hand.
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as
$$ begin insert into profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name'); return new; end $$;
create trigger on_signup after insert on auth.users for each row execute function handle_new_user();

create table products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,                      -- product identifier, e.g. LLL-0001
  slug text unique not null,
  title text not null,
  description text not null default '',
  collection text not null,                       -- one of the six collections
  product_type text not null,                     -- worksheet, bundle, planner...
  grade text, subject text,
  term int check (term between 1 and 4),
  week int check (week between 1 and 10),
  language text not null default 'English',
  price_cents int not null default 0 check (price_cents >= 0),  -- 0 means free
  cover_path text, preview_paths text[] not null default '{}',
  file_type text, file_size_bytes bigint, page_count int,
  learning_objectives text[] not null default '{}',
  included_contents text[] not null default '{}',
  print_info text, licence_info text,
  status text not null default 'draft' check (status in ('draft','published')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- The real downloadable files. Stored in PRIVATE storage; only the server may hand out links.
create table product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  storage_key text not null, file_name text not null, size_bytes bigint
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,             -- empty for guest checkout
  email text not null,
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled','refunded')),
  total_cents int not null check (total_cents >= 0),
  currency text not null default 'ZAR',
  gateway_reference text unique,                  -- payment provider's reference
  guest_token_hash text,                          -- hashed secret for guest order links
  created_at timestamptz not null default now(), paid_at timestamptz
);
create table order_items (
  order_id uuid not null references orders on delete cascade,
  product_id uuid not null references products,
  price_cents int not null, primary key (order_id, product_id)
);

-- Every payment notification is logged once. The unique id stops double-processing.
create table payment_events (
  gateway_event_id text primary key,
  payload jsonb not null, received_at timestamptz not null default now(), processed_at timestamptz
);
create table downloads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders, product_file_id uuid not null references product_files,
  ip_hash text, downloaded_at timestamptz not null default now()
);
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  user_id uuid not null references auth.users,
  rating int not null check (rating between 1 and 5), body text,
  verified_purchase boolean not null default false,   -- set by the server, never by the customer
  approved boolean not null default false,            -- hidden until you approve it
  created_at timestamptz not null default now(), unique (product_id, user_id)
);
create table faqs (id uuid primary key default gen_random_uuid(), question text not null, answer text not null, sort int default 0);
create table enquiries (id uuid primary key default gen_random_uuid(), name text, email text, message text, handled boolean default false, created_at timestamptz default now());
create table discount_codes (code text primary key, percent_off int check (percent_off between 1 and 100), active boolean default true, expires_at timestamptz);
create table site_text (key text primary key, value text not null);  -- About Me, homepage text, etc.

-- SECURITY: switch on row-level security everywhere, then open only what is safe.
alter table profiles enable row level security;    alter table products enable row level security;
alter table product_files enable row level security; alter table orders enable row level security;
alter table order_items enable row level security;  alter table payment_events enable row level security;
alter table downloads enable row level security;    alter table reviews enable row level security;
alter table faqs enable row level security;         alter table enquiries enable row level security;
alter table discount_codes enable row level security; alter table site_text enable row level security;

create policy "see own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "public sees published products" on products for select using (status = 'published' or is_admin());
create policy "admin manages products" on products for all using (is_admin()) with check (is_admin());
create policy "admin manages files" on product_files for all using (is_admin()) with check (is_admin());
create policy "customer sees own orders" on orders for select using (user_id = auth.uid() or is_admin());
create policy "customer sees own order items" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
create policy "admin reads downloads" on downloads for select using (is_admin());
create policy "public sees approved reviews" on reviews for select using (approved or user_id = auth.uid() or is_admin());
create policy "admin moderates reviews" on reviews for all using (is_admin()) with check (is_admin());
create policy "public reads faqs" on faqs for select using (true);
create policy "admin manages faqs" on faqs for all using (is_admin()) with check (is_admin());
create policy "admin reads enquiries" on enquiries for all using (is_admin()) with check (is_admin());
create policy "admin manages discounts" on discount_codes for all using (is_admin()) with check (is_admin());
create policy "public reads site text" on site_text for select using (true);
create policy "admin edits site text" on site_text for all using (is_admin()) with check (is_admin());
-- payment_events has no policy on purpose: only the server (service key) can touch it.
-- Orders, order items, downloads and new reviews are written by the server only, never the browser.

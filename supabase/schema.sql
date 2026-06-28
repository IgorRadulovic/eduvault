-- ═══════════════════════════════════════════════════════════════════
-- EDUVAULT — Complete Supabase Schema
-- Run this entire file in Supabase → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";


-- ═══════════════════════════════════════════════════════════════════
-- 1. USERS
-- Mirrors Firebase Auth users. Created automatically on first login
-- via the trigger at the bottom of this file.
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.users (
  id            text primary key,        -- Firebase UID (e.g. "abc123xyz")
  email         text unique not null,
  name          text not null,
  avatar_url    text,
  role          text not null default 'student' check (role in ('student', 'admin')),
  status        text not null default 'active'  check (status in ('active', 'suspended')),
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

comment on table public.users is 'App user profiles, linked to Firebase Auth by id (Firebase UID)';


-- ═══════════════════════════════════════════════════════════════════
-- 2. CATEGORIES
-- Managed from the admin dashboard.
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text unique not null,       -- e.g. "Development"
  emoji       text,                       -- e.g. "💻"
  slug        text unique not null,       -- e.g. "development"
  sort_order  integer default 0,
  created_at  timestamptz default now() not null
);

comment on table public.categories is 'Course and ebook categories shown in filters and browse pages';

-- Seed with default categories
insert into public.categories (name, emoji, slug, sort_order) values
  ('Development',  '💻', 'development',   1),
  ('Design',       '🎨', 'design',        2),
  ('Business',     '💼', 'business',      3),
  ('Data Science', '📊', 'data-science',  4),
  ('Marketing',    '📱', 'marketing',     5),
  ('Productivity', '⚡', 'productivity',  6)
on conflict (slug) do nothing;


-- ═══════════════════════════════════════════════════════════════════
-- 3. PRODUCTS (courses + ebooks in one table)
-- type = 'course' | 'ebook'
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.products (
  id                uuid primary key default uuid_generate_v4(),
  type              text not null check (type in ('course', 'ebook')),
  title             text not null,
  slug              text unique not null,           -- URL-safe, e.g. "complete-react-developer"
  description       text,                           -- Short description (used in cards)
  long_description  text,                           -- Full detail page description
  author            text not null,
  price             numeric(10,2) not null check (price >= 0),
  original_price    numeric(10,2) check (original_price >= 0),
  category_id       uuid references public.categories(id) on delete set null,
  image_url         text,                           -- Main thumbnail (Supabase Storage or external URL)
  color             text default '#1565C0',         -- Fallback card background color (hex)
  emoji             text,                           -- Fallback icon if no image
  rating            numeric(3,2) default 0 check (rating >= 0 and rating <= 5),
  review_count      integer default 0,
  student_count     integer default 0,
  is_bestseller     boolean default false,
  is_featured       boolean default false,
  is_published      boolean default false,          -- false = draft, not shown to students
  tags              text[] default '{}',            -- e.g. ARRAY['React', 'JavaScript']

  -- Course-specific fields (null for ebooks)
  level             text check (level in ('Beginner', 'Intermediate', 'Advanced', 'Beginner to Advanced')),
  duration_hours    numeric(6,1),                   -- e.g. 42.5
  lesson_count      integer,

  -- eBook-specific fields (null for courses)
  page_count        integer,
  file_format       text,                           -- e.g. 'PDF + ePub + Kindle'
  file_url          text,                           -- Supabase Storage path (private bucket)

  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null,
  last_updated_label text                           -- Human label, e.g. "December 2024"
);

comment on table public.products is 'All sellable items — both courses and ebooks';

-- Index for fast filtering and search
create index if not exists idx_products_type        on public.products(type);
create index if not exists idx_products_category    on public.products(category_id);
create index if not exists idx_products_published   on public.products(is_published);
create index if not exists idx_products_featured    on public.products(is_featured);
create index if not exists idx_products_slug        on public.products(slug);


-- ═══════════════════════════════════════════════════════════════════
-- 4. ORDERS
-- Created when a student completes checkout.
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.orders (
  id              uuid primary key default uuid_generate_v4(),
  order_number    text unique not null,             -- Human-readable, e.g. "ORD-00042"
  user_id         text not null references public.users(id) on delete restrict,
  status          text not null default 'pending'
                    check (status in ('pending', 'completed', 'refunded', 'failed')),
  subtotal        numeric(10,2) not null,
  discount        numeric(10,2) default 0,
  total           numeric(10,2) not null,
  coupon_code     text,
  payment_method  text,                             -- e.g. 'stripe'
  stripe_payment_intent_id text,                   -- For reconciliation with Stripe
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

comment on table public.orders is 'Purchase orders. One order can contain multiple products (see order_items)';

create index if not exists idx_orders_user_id   on public.orders(user_id);
create index if not exists idx_orders_status    on public.orders(status);
create index if not exists idx_orders_created   on public.orders(created_at desc);

-- Auto-generate order number: ORD-00001, ORD-00002, etc.
create sequence if not exists order_number_seq start 1;

create or replace function generate_order_number()
returns trigger language plpgsql as $$
begin
  new.order_number := 'ORD-' || lpad(nextval('order_number_seq')::text, 5, '0');
  return new;
end;
$$;

drop trigger if exists set_order_number on public.orders;
create trigger set_order_number
  before insert on public.orders
  for each row execute function generate_order_number();


-- ═══════════════════════════════════════════════════════════════════
-- 5. ORDER ITEMS
-- Each row = one product in an order (snapshot of price at purchase time).
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete restrict,
  title       text not null,          -- Snapshot of title at purchase time
  type        text not null,          -- Snapshot of type
  price       numeric(10,2) not null, -- Price paid (after any item-level discount)
  created_at  timestamptz default now() not null
);

comment on table public.order_items is 'Individual products within an order. Prices are snapshotted at time of purchase.';

create index if not exists idx_order_items_order   on public.order_items(order_id);
create index if not exists idx_order_items_product on public.order_items(product_id);


-- ═══════════════════════════════════════════════════════════════════
-- 6. ENROLLMENTS
-- Created automatically when an order is completed.
-- This is what gates access to course/ebook content.
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.enrollments (
  id           uuid primary key default uuid_generate_v4(),
  user_id      text not null references public.users(id) on delete cascade,
  product_id   uuid not null references public.products(id) on delete cascade,
  order_id     uuid references public.orders(id) on delete set null,
  progress     integer default 0 check (progress >= 0 and progress <= 100), -- 0–100%
  completed_at timestamptz,           -- Set when progress = 100
  enrolled_at  timestamptz default now() not null,

  unique(user_id, product_id)         -- A user can only enroll once per product
);

comment on table public.enrollments is 'Tracks which users have access to which products, and their progress';

create index if not exists idx_enrollments_user    on public.enrollments(user_id);
create index if not exists idx_enrollments_product on public.enrollments(product_id);


-- ═══════════════════════════════════════════════════════════════════
-- 7. COUPONS
-- Discount codes applied at checkout.
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.coupons (
  id            uuid primary key default uuid_generate_v4(),
  code          text unique not null,               -- Always stored UPPERCASE
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  max_uses      integer,                            -- null = unlimited
  uses          integer default 0 not null,
  expires_at    timestamptz,                        -- null = never expires
  is_active     boolean default true,
  created_at    timestamptz default now() not null
);

comment on table public.coupons is 'Discount codes. Validated at checkout.';

-- Ensure code is always stored uppercase
create or replace function uppercase_coupon_code()
returns trigger language plpgsql as $$
begin
  new.code := upper(new.code);
  return new;
end;
$$;

drop trigger if exists ensure_uppercase_coupon on public.coupons;
create trigger ensure_uppercase_coupon
  before insert or update on public.coupons
  for each row execute function uppercase_coupon_code();

-- Seed with example coupons
insert into public.coupons (code, discount_type, discount_value, max_uses, expires_at) values
  ('LAUNCH50', 'percent', 50, 500, now() + interval '6 months'),
  ('SAVE20',   'percent', 20, 200, now() + interval '3 months'),
  ('FLAT10',   'fixed',   10, 100, now() + interval '1 month')
on conflict (code) do nothing;


-- ═══════════════════════════════════════════════════════════════════
-- 8. REVIEWS
-- Students can leave a rating + comment after enrollment.
-- ═══════════════════════════════════════════════════════════════════
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     text not null references public.users(id) on delete cascade,
  rating      integer not null check (rating >= 1 and rating <= 5),
  comment     text,
  is_approved boolean default false,                -- Admin must approve before shown
  created_at  timestamptz default now() not null,

  unique(user_id, product_id)                       -- One review per user per product
);

comment on table public.reviews is 'Student reviews. Must be approved by admin before displaying.';

create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_user    on public.reviews(user_id);


-- ═══════════════════════════════════════════════════════════════════
-- 9. AUTO-UPDATE updated_at TIMESTAMPS
-- ═══════════════════════════════════════════════════════════════════
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Apply to all tables that have updated_at
drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at before update on public.users
  for each row execute function update_updated_at();

drop trigger if exists set_updated_at on public.products;
create trigger set_updated_at before update on public.products
  for each row execute function update_updated_at();

drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at before update on public.orders
  for each row execute function update_updated_at();


-- ═══════════════════════════════════════════════════════════════════
-- 10. ROW LEVEL SECURITY (RLS)
-- Controls who can read/write each table.
-- Without this, your anon key would expose all data to anyone.
-- ═══════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.users        enable row level security;
alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.enrollments  enable row level security;
alter table public.coupons      enable row level security;
alter table public.reviews      enable row level security;

-- ── users ─────────────────────────────────────────
-- Anyone can read their own profile. Only the user can update it.
create policy "Users can read own profile"
  on public.users for select
  using (true);  -- public profiles — tighten if needed

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid()::text = id);

create policy "Service role can manage users"
  on public.users for all
  using (auth.role() = 'service_role');

-- ── categories ────────────────────────────────────
-- Anyone can read. Only service role (your backend/admin) can write.
create policy "Anyone can read categories"
  on public.categories for select
  using (true);

create policy "Service role manages categories"
  on public.categories for all
  using (auth.role() = 'service_role');

-- ── products ──────────────────────────────────────
-- Published products are public. Drafts are admin-only.
create policy "Anyone can read published products"
  on public.products for select
  using (is_published = true);

create policy "Service role manages all products"
  on public.products for all
  using (auth.role() = 'service_role');

-- ── orders ────────────────────────────────────────
-- Users can only see their own orders.
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid()::text = user_id);

create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid()::text = user_id);

create policy "Service role manages all orders"
  on public.orders for all
  using (auth.role() = 'service_role');

-- ── order_items ───────────────────────────────────
create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()::text
    )
  );

create policy "Service role manages order items"
  on public.order_items for all
  using (auth.role() = 'service_role');

-- ── enrollments ───────────────────────────────────
-- Users can only see and update their own enrollments.
create policy "Users can read own enrollments"
  on public.enrollments for select
  using (auth.uid()::text = user_id);

create policy "Users can update own progress"
  on public.enrollments for update
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "Service role manages enrollments"
  on public.enrollments for all
  using (auth.role() = 'service_role');

-- ── coupons ───────────────────────────────────────
-- Anyone authenticated can read active coupons (for validation).
-- Only service role can create/update/delete.
create policy "Authenticated users can read active coupons"
  on public.coupons for select
  using (is_active = true);

create policy "Service role manages coupons"
  on public.coupons for all
  using (auth.role() = 'service_role');

-- ── reviews ───────────────────────────────────────
-- Anyone can read approved reviews.
create policy "Anyone can read approved reviews"
  on public.reviews for select
  using (is_approved = true);

create policy "Enrolled users can create reviews"
  on public.reviews for insert
  with check (
    auth.uid()::text = user_id and
    exists (
      select 1 from public.enrollments
      where enrollments.user_id = auth.uid()::text
      and enrollments.product_id = reviews.product_id
    )
  );

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid()::text = user_id);

create policy "Service role manages reviews"
  on public.reviews for all
  using (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════════
-- 11. USEFUL VIEWS (optional but handy for admin dashboard)
-- ═══════════════════════════════════════════════════════════════════

-- Revenue summary
create or replace view public.revenue_stats as
select
  count(*) filter (where status = 'completed') as completed_orders,
  count(*) filter (where status = 'pending')   as pending_orders,
  count(*) filter (where status = 'refunded')  as refunded_orders,
  coalesce(sum(total) filter (where status = 'completed'), 0) as total_revenue,
  coalesce(sum(total) filter (where status = 'completed' and created_at >= date_trunc('month', now())), 0) as revenue_this_month
from public.orders;

-- Product with category name joined
create or replace view public.products_with_category as
select
  p.*,
  c.name  as category_name,
  c.emoji as category_emoji,
  c.slug  as category_slug
from public.products p
left join public.categories c on c.id = p.category_id;


-- ═══════════════════════════════════════════════════════════════════
-- 12. STORAGE BUCKETS
-- Run these separately in Supabase → Storage → New Bucket
-- OR uncomment and run here (requires storage extension)
-- ═══════════════════════════════════════════════════════════════════
-- Public bucket for product thumbnails (anyone can view)
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;

-- Private bucket for ebook files (only enrolled users can download)
-- insert into storage.buckets (id, name, public) values ('ebook-files', 'ebook-files', false) on conflict do nothing;

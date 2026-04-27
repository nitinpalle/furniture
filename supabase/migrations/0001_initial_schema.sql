-- =============================================================
-- Furniture Catalog & WhatsApp Inquiry Platform
-- Initial schema migration
-- =============================================================
-- Creates: extensions, tables, indexes, RLS policies, helper fns
-- Apply order: 0001 (this) → 0002 (storage) → 0003 (seed)
-- =============================================================

-- ----- Extensions -----
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- =============================================================
-- HELPER: updated_at auto-touch trigger
-- =============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- HELPER: is_admin() — used in RLS policies
-- All authenticated users are admins for v1 (single role).
-- Refactor to a roles table when we need multi-role.
-- =============================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null;
$$;

-- =============================================================
-- CATEGORIES (2-level hierarchy via parent_id)
-- =============================================================
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references public.categories(id) on delete cascade,
  name          text not null,
  slug          text not null unique,
  description   text,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index categories_parent_id_idx on public.categories(parent_id);
create index categories_display_order_idx on public.categories(display_order);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

create policy "categories_select_public"
  on public.categories for select
  using (true);

create policy "categories_admin_all"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- SUPPLIERS (private — admin-only access, never exposed publicly)
-- =============================================================
create table public.suppliers (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null,
  country                  text not null,
  city                     text,
  contact_name             text,
  whatsapp                 text,
  email                    text,
  website                  text,
  address                  text,
  notes                    text,
  default_lead_time_days   int,
  default_moq              int,
  tags                     text[] not null default '{}',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index suppliers_country_idx on public.suppliers(country);

create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

alter table public.suppliers enable row level security;

-- NO public select policy — suppliers are admin-only.
create policy "suppliers_admin_all"
  on public.suppliers for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- SERIES / COLLECTIONS
-- =============================================================
create table public.series (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  hero_image    text,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index series_display_order_idx on public.series(display_order);

create trigger series_set_updated_at
  before update on public.series
  for each row execute function public.set_updated_at();

alter table public.series enable row level security;

create policy "series_select_public"
  on public.series for select
  using (true);

create policy "series_admin_all"
  on public.series for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- PRODUCTS
-- =============================================================
create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  sku                 text,                                  -- e.g. "6712#"
  description         text,                                  -- AI-drafted, admin-editable
  description_source  text not null default 'manual'
                      check (description_source in ('manual', 'ai')),
  category_id         uuid references public.categories(id) on delete set null,
  subcategory_id      uuid references public.categories(id) on delete set null,
  series_id           uuid references public.series(id) on delete set null,
  supplier_id         uuid references public.suppliers(id) on delete set null,  -- private
  country_of_origin   text,                                  -- public (defaults from supplier.country at write time in app)
  dimensions          text,                                  -- "300 x 100 x 76 cm"
  material            text,
  color               text,
  capacity            text,                                  -- "Seats 8"
  moq                 int,
  lead_time_days      int,
  price               numeric(10, 2),                        -- B2C-ready, hidden in B2B UI
  project_types       text[] not null default '{}',          -- ['hospitality','residential','office','restaurant']
  status              text not null default 'draft'
                      check (status in ('draft', 'published')),
  is_featured         boolean not null default false,
  image_urls          text[] not null default '{}',          -- in display order
  spec_pdf_url        text,
  created_by          uuid references auth.users(id) on delete set null,
  updated_by          uuid references auth.users(id) on delete set null,
  deleted_at          timestamptz,                           -- soft delete
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index products_status_idx on public.products(status) where deleted_at is null;
create index products_category_id_idx on public.products(category_id) where deleted_at is null;
create index products_subcategory_id_idx on public.products(subcategory_id) where deleted_at is null;
create index products_series_id_idx on public.products(series_id) where deleted_at is null;
create index products_supplier_id_idx on public.products(supplier_id) where deleted_at is null;
create index products_is_featured_idx on public.products(is_featured) where is_featured = true and deleted_at is null;
create index products_project_types_idx on public.products using gin(project_types);
create index products_search_idx on public.products
  using gin (
    to_tsvector(
      'english',
      coalesce(name, '') || ' ' ||
      coalesce(sku, '') || ' ' ||
      coalesce(description, '')
    )
  );

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

-- Public can only see published, non-deleted products.
create policy "products_select_public"
  on public.products for select
  using (status = 'published' and deleted_at is null);

create policy "products_admin_all"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- PRODUCT_RELATIONS (matching chairs ↔ tables, similar items)
-- =============================================================
create table public.product_relations (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  related_id      uuid not null references public.products(id) on delete cascade,
  relation_type   text not null default 'matching'
                  check (relation_type in ('matching', 'similar')),
  display_order   int not null default 0,
  created_at      timestamptz not null default now(),
  unique (product_id, related_id),
  check (product_id <> related_id)
);

create index product_relations_product_id_idx on public.product_relations(product_id);
create index product_relations_related_id_idx on public.product_relations(related_id);

alter table public.product_relations enable row level security;

create policy "product_relations_select_public"
  on public.product_relations for select
  using (true);

create policy "product_relations_admin_all"
  on public.product_relations for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================
-- ENQUIRY_CLICKS (analytics — tracks every WhatsApp CTA click)
-- =============================================================
create table public.enquiry_clicks (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete set null, -- null for non-product CTAs
  source      text not null
              check (source in ('pdp', 'card', 'floating', 'hero', 'footer')),
  ip_address  text,
  user_agent  text,
  referrer    text,
  created_at  timestamptz not null default now()
);

create index enquiry_clicks_created_at_idx on public.enquiry_clicks(created_at desc);
create index enquiry_clicks_product_id_idx on public.enquiry_clicks(product_id);
create index enquiry_clicks_source_idx on public.enquiry_clicks(source);

alter table public.enquiry_clicks enable row level security;

-- No anon insert — server-only via service-role key in /api/track-click.
-- Admins can read for analytics dashboards.
create policy "enquiry_clicks_admin_read"
  on public.enquiry_clicks for select
  using (public.is_admin());

-- =============================================================
-- SETTINGS (key-value store for runtime config)
-- =============================================================
create table public.settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

alter table public.settings enable row level security;

-- No public read by default. Specific keys can be exposed via a server fn later.
create policy "settings_admin_all"
  on public.settings for all
  using (public.is_admin())
  with check (public.is_admin());

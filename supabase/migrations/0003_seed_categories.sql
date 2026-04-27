-- =============================================================
-- Seed: 6 starter top-level categories + sub-categories
-- =============================================================
-- Idempotent — re-running this is a no-op (uses on conflict).
-- Apply after 0001 + 0002.
-- =============================================================

-- ----- Top-level categories -----
insert into public.categories (id, parent_id, name, slug, display_order)
values
  ('11111111-1111-1111-1111-111111111101', null, 'Dining',       'dining',       10),
  ('11111111-1111-1111-1111-111111111102', null, 'Living Room',  'living-room',  20),
  ('11111111-1111-1111-1111-111111111103', null, 'Bedroom',      'bedroom',      30),
  ('11111111-1111-1111-1111-111111111104', null, 'Office',       'office',       40),
  ('11111111-1111-1111-1111-111111111105', null, 'Outdoor',      'outdoor',      50),
  ('11111111-1111-1111-1111-111111111106', null, 'Storage',      'storage',      60)
on conflict (id) do nothing;

-- ----- Sub-categories -----
insert into public.categories (parent_id, name, slug, display_order)
values
  -- Dining
  ('11111111-1111-1111-1111-111111111101', 'Dining Tables',      'dining-tables',      10),
  ('11111111-1111-1111-1111-111111111101', 'Dining Chairs',      'dining-chairs',      20),
  ('11111111-1111-1111-1111-111111111101', 'Bar Stools',         'bar-stools',         30),

  -- Living Room
  ('11111111-1111-1111-1111-111111111102', 'Sofas',              'sofas',              10),
  ('11111111-1111-1111-1111-111111111102', 'Sectionals',         'sectionals',         20),
  ('11111111-1111-1111-1111-111111111102', 'Recliners',          'recliners',          30),
  ('11111111-1111-1111-1111-111111111102', 'Coffee Tables',      'coffee-tables',      40),
  ('11111111-1111-1111-1111-111111111102', 'Side Tables',        'side-tables',        50),
  ('11111111-1111-1111-1111-111111111102', 'TV Units',           'tv-units',           60),

  -- Bedroom
  ('11111111-1111-1111-1111-111111111103', 'Beds',               'beds',               10),
  ('11111111-1111-1111-1111-111111111103', 'Bedside Tables',     'bedside-tables',     20),
  ('11111111-1111-1111-1111-111111111103', 'Dressers',           'dressers',           30),
  ('11111111-1111-1111-1111-111111111103', 'Wardrobes',          'wardrobes',          40),

  -- Office
  ('11111111-1111-1111-1111-111111111104', 'Office Desks',       'office-desks',       10),
  ('11111111-1111-1111-1111-111111111104', 'Office Chairs',      'office-chairs',      20),
  ('11111111-1111-1111-1111-111111111104', 'Conference Tables',  'conference-tables',  30),
  ('11111111-1111-1111-1111-111111111104', 'Cabinets',           'cabinets',           40),

  -- Outdoor
  ('11111111-1111-1111-1111-111111111105', 'Outdoor Sofas',      'outdoor-sofas',      10),
  ('11111111-1111-1111-1111-111111111105', 'Outdoor Dining',     'outdoor-dining',     20),
  ('11111111-1111-1111-1111-111111111105', 'Loungers',           'loungers',           30),

  -- Storage
  ('11111111-1111-1111-1111-111111111106', 'Bookshelves',        'bookshelves',        10),
  ('11111111-1111-1111-1111-111111111106', 'Sideboards',         'sideboards',         20),
  ('11111111-1111-1111-1111-111111111106', 'Shoe Racks',         'shoe-racks',         30)
on conflict (slug) do nothing;

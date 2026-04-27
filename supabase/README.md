# Supabase setup

This directory contains the database migrations and seed data for the Furniture catalog. There are three SQL files, applied in order:

| File | Purpose |
|---|---|
| [`migrations/0001_initial_schema.sql`](migrations/0001_initial_schema.sql) | Tables, RLS, indexes, helper functions, triggers |
| [`migrations/0002_storage_buckets.sql`](migrations/0002_storage_buckets.sql) | Storage buckets (`products`, `series-heroes`, `spec-pdfs`, `catalogs`) and their access policies |
| [`migrations/0003_seed_categories.sql`](migrations/0003_seed_categories.sql) | 6 top-level categories + sub-categories (idempotent) |

## Apply migrations

Pick the route that matches your Supabase setup.

### Option A — Supabase Studio SQL editor (easiest, no CLI required)

1. Open your project at https://supabase.com/dashboard/project/_/sql
2. Open `migrations/0001_initial_schema.sql`, copy its contents, paste into the SQL editor, click **Run**
3. Repeat for `0002_storage_buckets.sql`
4. Repeat for `0003_seed_categories.sql`
5. Verify in **Table Editor**: you should see `categories`, `suppliers`, `series`, `products`, `product_relations`, `enquiry_clicks`, `settings` plus 6 top-level categories + sub-categories seeded
6. Verify in **Storage**: 4 buckets (`products`, `series-heroes`, `spec-pdfs` public; `catalogs` private)

### Option B — Supabase CLI (`supabase` binary)

```bash
# 1. Install the CLI (one-time)
# macOS:
brew install supabase/tap/supabase
# Windows (scoop):
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
# npm fallback (any OS):
npm install -g supabase

# 2. Authenticate
supabase login

# 3. Link this directory to your project
supabase link --project-ref <your-project-ref>

# 4. Push the migrations
supabase db push
```

## Regenerate TypeScript types

Once migrations are applied:

```bash
# Set your project ref (or export SUPABASE_PROJECT_REF in .env.local)
export SUPABASE_PROJECT_REF=<your-project-ref>

# Regenerate the types from the live schema
npm run db:types
```

This overwrites `lib/database.types.ts` with auto-generated types so the app's TypeScript matches the live DB.

## Reset / re-apply

The seed migration (0003) is idempotent (`on conflict do nothing`), so re-running it is safe.

For 0001/0002: if you need to start over during dev, drop the schema first (Studio SQL editor):

```sql
drop table if exists public.product_relations cascade;
drop table if exists public.products          cascade;
drop table if exists public.series            cascade;
drop table if exists public.suppliers         cascade;
drop table if exists public.categories        cascade;
drop table if exists public.enquiry_clicks    cascade;
drop table if exists public.settings          cascade;
drop function if exists public.is_admin();
drop function if exists public.set_updated_at();
-- buckets:
delete from storage.buckets where id in ('products', 'series-heroes', 'spec-pdfs', 'catalogs');
```

## Auth setup

After migrations are applied, create your first admin user via Supabase Studio:

1. Go to **Authentication → Users → Add user → Create new user**
2. Set email + password
3. Email confirmation disabled is fine for the first admin (you control the credential)

Subsequent admins are added the same way (closed signup — no public sign-up page in v1).

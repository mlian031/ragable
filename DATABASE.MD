# Supabase SQL Migration for Stripe Subscriptions Integration

This file contains the SQL statements to add Stripe subscription support to your Supabase project, modeled after `nextjs-subscription-payments`.

---

## 1. ENUM Types

```sql
-- Pricing types
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');

-- Billing intervals
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');

-- Subscription statuses
CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused'
);
```

---

## 2. Customers Table

```sql
CREATE TABLE public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Private table, no user access
-- (No select/update policies)
```

---

## 3. Products Table (synced from Stripe)

```sql
CREATE TABLE public.products (
  id TEXT PRIMARY KEY, -- Stripe product ID
  active BOOLEAN,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access to products" ON public.products FOR SELECT USING (true);
```

---

## 4. Prices Table (synced from Stripe)

```sql
CREATE TABLE public.prices (
  id TEXT PRIMARY KEY, -- Stripe price ID
  product_id TEXT REFERENCES public.products(id),
  active BOOLEAN,
  description TEXT,
  unit_amount BIGINT,
  currency TEXT CHECK (char_length(currency) = 3),
  type pricing_type,
  interval pricing_plan_interval,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB
);

ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access to prices" ON public.prices FOR SELECT USING (true);
```

---

## 5. Subscriptions Table (synced from Stripe)

```sql
CREATE TABLE public.subscriptions (
  id TEXT PRIMARY KEY, -- Stripe subscription ID
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status subscription_status,
  metadata JSONB,
  price_id TEXT REFERENCES public.prices(id),
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  current_period_start TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  current_period_end TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
```

---

## 6. Optional: Publication for Realtime (if you want to listen to changes)

```sql
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE products, prices;
```

---

## 7. Summary

- These tables will be **populated and updated by your webhook handler** when Stripe events occur.
- Your existing `profiles` table and usage functions **remain unchanged**.
- You can **update `profiles.plan_id`** based on subscription status (e.g., `'pro'` or `'free'`) in your webhook logic for quick access.

---

## 8. Execution Order

Run the above **in order**:

1. ENUM types
2. `customers`
3. `products`
4. `prices`
5. `subscriptions`
6. (Optional) publication

---

Paste these into Supabase SQL editor **step by step** or as a single script.

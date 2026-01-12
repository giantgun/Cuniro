-- tables.sql
-- Run first: creates core tables and enables RLS

CREATE TABLE IF NOT EXISTS public.escrows (
  terms text NOT NULL,
  dispute_reason text,
  listing_title text NOT NULL,
  buyer_address text NOT NULL,
  status text NOT NULL,
  id bigint NOT NULL,
  arbiter_address text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  amount bigint NOT NULL,
  timeout bigint NOT NULL,
  listing_id bigint NOT NULL,
  seller_address text NOT NULL,
  arbiter_name text NOT NULL
);
ALTER TABLE public.escrows ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.listings (
  terms text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  price bigint NOT NULL,
  bedrooms bigint NOT NULL,
  bathrooms bigint NOT NULL,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  description text NOT NULL,
  location text,
  contact text,
  id bigint NOT NULL,
  status text DEFAULT 'active'::text,
  image_url text NOT NULL
);
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.profiles (
  address text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  id uuid NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- init_db.sql
-- Single-file convenience script that runs in order: tables -> policies -> functions -> triggers

-- TABLES
-- (Copied from tables.sql)
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

-- POLICIES
-- (Copied from policies.sql)
CREATE POLICY "Enable read access for all users" ON public.listings FOR SELECT TO public USING (true);
CREATE POLICY "Enable delete for users based on user_id" ON public.listings FOR DELETE TO public USING (((( SELECT auth.uid() AS uid) = owner_id) AND (status = 'available'::text)));
CREATE POLICY "Enable update for users based on user_id" ON public.listings FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = owner_id)) WITH CHECK (true);

CREATE POLICY "Can only view own profile data." ON public.profiles FOR SELECT TO public USING ((auth.uid() = id));
CREATE POLICY "Can only update own profile data." ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id));
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT TO public USING (true);

CREATE POLICY "allow read access for all interested parties" ON public.escrows FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.address = ANY (ARRAY[escrows.buyer_address, escrows.seller_address, escrows.arbiter_address]))))));

CREATE POLICY "access cont" ON public.escrows FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (((profiles.address = escrows.buyer_address) AND (escrows.status = 'pending'::text)) OR ((profiles.address = escrows.arbiter_address) AND (escrows.status = 'disputed'::text)) OR ((profiles.address = escrows.seller_address) AND (escrows.status = 'pending'::text) AND ((escrows.created_at + ((escrows.timeout)::double precision * '00:00:01'::interval)) <= now()))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.address = ANY (ARRAY[escrows.buyer_address, escrows.arbiter_address, escrows.seller_address]))))));

CREATE POLICY "access cont select" ON public.escrows FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (((profiles.address = escrows.buyer_address) AND (escrows.status = 'pending'::text)) OR ((profiles.address = escrows.arbiter_address) AND (escrows.status = 'disputed'::text)) OR ((profiles.address = escrows.seller_address) AND (escrows.status = 'pending'::text) AND ((escrows.created_at + ((escrows.timeout)::double precision * '00:00:01'::interval)) <= now())))))));

-- FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (
    new.id
  );
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_listing_status_from_escrow()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    target_status TEXT;
BEGIN
    -- Determine the new status for the listing
    target_status := CASE 
        WHEN NEW.status = 'pending'   THEN 'escrowed'
        WHEN NEW.status = 'completed' THEN 'rented'
        WHEN NEW.status = 'disputed'  THEN 'disputed'
        WHEN NEW.status = 'refunded'  THEN 'available'
        ELSE NULL -- Don't change if it's an unmapped status
    END;

    -- Only proceed if we have a valid status mapping
    IF target_status IS NOT NULL THEN
        -- Check if it's an INSERT or if the status actually changed during UPDATE
        IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
            UPDATE public.listings
            SET status = target_status
            WHERE id = NEW.listing_id; -- *** DOUBLE CHECK THIS COLUMN NAME ***
        END IF;
    END IF;

    RETURN NEW;
END;
$function$
;

-- TRIGGERS
CREATE TRIGGER on_escrow_status_update AFTER UPDATE ON public.escrows FOR EACH ROW EXECUTE FUNCTION sync_listing_status_from_escrow();
CREATE TRIGGER on_escrow_status_change AFTER INSERT OR UPDATE ON public.escrows FOR EACH ROW EXECUTE FUNCTION sync_listing_status_from_escrow();
CREATE TRIGGER on_escrow_statuses_update AFTER UPDATE ON public.escrows FOR EACH ROW EXECUTE FUNCTION sync_listing_status_from_escrow();

-- Trigger for auth user creation
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

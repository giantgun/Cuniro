-- policies.sql
-- Run after `tables.sql` to add Row Level Security (RLS) policies

-- Listings
CREATE POLICY "Enable read access for all users" ON public.listings FOR SELECT TO public USING (true);
CREATE POLICY "Enable delete for users based on user_id" ON public.listings FOR DELETE TO public USING (((( SELECT auth.uid() AS uid) = owner_id) AND (status = 'available'::text)));
CREATE POLICY "Enable update for users based on user_id" ON public.listings FOR UPDATE TO public USING ((( SELECT auth.uid() AS uid) = owner_id)) WITH CHECK (true);

-- Profiles
CREATE POLICY "Can only view own profile data." ON public.profiles FOR SELECT TO public USING ((auth.uid() = id));
CREATE POLICY "Can only update own profile data." ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id));
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT TO public USING (true);

-- Escrows
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

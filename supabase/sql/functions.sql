-- functions.sql
-- Run after tables and policies (functions rely on profiles/listings tables)

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

-- triggers.sql
-- Run after `functions.sql`

CREATE TRIGGER on_escrow_status_update AFTER UPDATE ON public.escrows FOR EACH ROW EXECUTE FUNCTION sync_listing_status_from_escrow();
CREATE TRIGGER on_escrow_status_change AFTER INSERT OR UPDATE ON public.escrows FOR EACH ROW EXECUTE FUNCTION sync_listing_status_from_escrow();
CREATE TRIGGER on_escrow_statuses_update AFTER UPDATE ON public.escrows FOR EACH ROW EXECUTE FUNCTION sync_listing_status_from_escrow();

-- Trigger to populate `profiles` when a new auth user is created
-- This must be created in the `auth` schema
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

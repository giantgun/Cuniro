# Cuniro

Student-focused rental marketplace & escrow platform using MNEE stablecoin (demo).

Cuniro implements the EscrowManager smart contract [goto EscrowManager->](https://github.com/giantgun/EscrowManager) and uses the MNEE USD‑backed ERC‑20 stablecoin for listings and automated escrow flows. Using a stablecoin like MNEE provides price stability and enables programmable payments and financial automation, making commerce more predictable and simple.

Cuniro is a platform for student housing rentals that uses MNEE for payments and on-chain escrow. It includes a UI for listings, secure escrow creation, a local faucet for minting mock MNEE, and sample integration points for the EscrowManager contract.

## Table of Contents

- [Quick Deploy](#quick-deploy)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Supabase Setup](#supabase-setup)
- [Database Schema](#database-schema)

## Quick Deploy ✅

Follow these steps to deploy quickly:

1. Prerequisites
   - Node.js 18+
   - pnpm
   - Deployed EscrowManager with MNEE ERC20 ([goto EscrowManager->](https://github.com/giantgun/EscrowManager) ) 
   - A Supabase project


3. Create a Supabase Storage bucket named `listing-images` for image file uploads (used by the app)

2. Apply database SQL (Supabase)
Run the SQL files in `supabase/sql/` in order: `tables.sql`, `policies.sql`, `functions.sql`, `triggers.sql` in SQL Editor in the Supabase dashboard (or use `init_db.sql`)([see Supabase Setup](#supabase-setup)).

2. Minimum environment variables
- `NEXT_PUBLIC_PUBLISHABLE_DEFAULT_KEY`: Get it from your supabase dashboard
- `NEXT_PUBLIC_SUPABASE_URL`: Get it from your supabase dashboard
- `NEXT_PUBLIC_ESCROW_MANAGER_ADDRESS`: EscrowManager Contract address
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`: name of your Supabase storage bucket (e.g. `listing-images`) — the app expects this bucket name for uploads and public URLs.
- `NEXT_PUBLIC_MNEE_ADDRESS`(Optional) for Faucet in testnet
- `NEXT_PUBLIC_NETWORK`(Optional) set to sepolia in dev mode
- `NEXT_PUBLIC_IS_DEV`(Optional) set to true in dev mode

3. Install & build
```bash
pnpm install
pnpm build
```

5. Deploy
- Example (Vercel): add the repository to Vercel, set the environment variables, set the build command to `pnpm build`, then deploy.

See the full **Supabase Setup** and **Deployment** sections below for details and troubleshooting.

## Features

- 🔐 Non-Custodial Escrows: Funds are held in on-chain escrows until release or dispute
- 🧾 Simple Escrow Flows: Create escrows, release funds, raise disputes, and arbitrate
- 💸 Mock MNEE Faucet: Mint Mock MNEE tokens locally via the `/faucet` page
- ♿ Accessibility-first UI: Semantic HTML, labels and ARIA where appropriate
- ⚡ Fast Local Dev: Next.js + Tailwind + Supabase for quick iteration

## Non-Custodial Architecture

This demo enforces escrow logic on-chain using the EscrowManager smart contract [goto EscrowManager->](https://github.com/giantgun/EscrowManager). Payments are done using MNEE, a USD‑backed ERC‑20 stablecoin—this gives price stability and enables programmable, automated payments and escrow workflows that simplify commerce and financial automation. The app never holds user funds directly, users approve the escrow contract to transfer MNEE from their wallets.

```text
┌─────────────────────────────────────────────────────────────┐
│                      Your Wallet (USER)                     │
│  - Approve EscrowManager to spend MNEE on your behalf         │
│  - Interact with UI to create / release / dispute escrows    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     EscrowManager Contract                   │
│  - createEscrow / release / dispute / arbitrate              │
│  - reads MNEE token balances and enforces on-chain rules     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         MNEE ERC-20                         │
│  - USD-backed stablecoin used for payments and automated     │
│    escrow flows (enables predictable pricing & automation)   │
└─────────────────────────────────────────────────────────────┘
```

## Why Non-Custodial Matters

- ✅ You Own Your Funds: Tokens remain in user wallets / approved contracts
- ✅ On-Chain Guarantees: Escrow rules are executed by smart contracts
- ✅ Transparent Audit Trail: All actions are visible on-chain

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- UI: Radix UI primitives
- Blockchain: Ethers.js (interacts with MNEE & EscrowManager contracts)
- Data: Supabase (Postgres database)
- Tooling: pnpm, Prettier, ESLint

## Project Structure
```text
├── app/                   # Next.js app router pages
├── components/            # React components & modals
├── components/ui/         # Design system components (Radix + Tailwind)
├── hooks/                 # Hooks (use-contract, use-wallet, supabase helpers)
├── lib/                   # Utilities
├── public/                # Static assets
├── styles/                # Global styles
```
## Supabase Setup (Details)

Follow these steps to create and configure a Supabase project for this app.

1. Create a Supabase account at https://supabase.com and create a new **Project** (select a region and set a strong DB password).
2. From **Project → Settings → API**, copy your **SUPABASE_URL**, **anon** key and **service_role** key. Keep the `service_role` secret (server-only).

### Run SQL (Dashboard / UI), recommended for most users

This project includes SQL scripts in `supabase/sql/`. The easiest way to apply them is via the Supabase **Dashboard → SQL Editor**:

1. Open your Supabase Project and go to **SQL → SQL Editor**.
2. Click **New query**.
3. Paste the contents of `supabase/sql/tables.sql` into the editor and click **Run**. Verify the tables appear under **Table Editor → public**.
4. Repeat for the remaining files in this exact order:
   1. `supabase/sql/policies.sql`  
      - Note: `policies.sql` includes storage RLS policies for the `listing-images` bucket used by this app.
   2. `supabase/sql/functions.sql`
   3. `supabase/sql/triggers.sql`
5. Confirm Row Level Security (RLS) is enabled for the tables (the `tables.sql` includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`), and check policies in **Auth / Policies** or run a quick `SELECT` to validate behavior.
#### Storage bucket RLS (Supabase Storage) 🔐

This project uses Supabase Storage for listing images. To restrict file access to owners and to provide optional public read access (for listing images), add Row Level Security policies on the `storage.objects` table in the `storage` schema. Run these in the SQL editor or via psql.

Example policies (this project uses the `listing-images`):

```sql
-- Public read for the `listing-images` bucket (optional)
create policy "Give everyone read access (listing-images)" on storage.objects
  for select using (
    bucket_id = 'listing-images'
  );

-- Owner-only management for `listing-images` (folder-based ownership)
create policy "Owners can insert into listing-images" on storage.objects
  for insert with check (
    bucket_id = 'listing-images' and (auth.uid()::text) = (storage.foldername(name))[1]
  );

create policy "Owners can select from listing-images" on storage.objects
  for select using (
    bucket_id = 'listing-images' and (auth.uid()::text) = (storage.foldername(name))[1]
  );

create policy "Owners can update in listing-images" on storage.objects
  for update using (
    bucket_id = 'listing-images' and (auth.uid()::text) = (storage.foldername(name))[1]
  );

create policy "Owners can delete from listing-images" on storage.objects
  for delete using (
    bucket_id = 'listing-images' and (auth.uid()::text) = (storage.foldername(name))[1]
  );
```

Notes:
- The app assumes a folder structure of `"{userId}/listings/images/{filename}"` within the `listing-images` bucket (e.g., `"123e4567-89ab-cdef-0123-456789abcdef/listings/images/uuid.jpg"`).
- Use the environment variable `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` set to `listing-images` so the client code uploads and serves URLs correctly.

Notes:
- These policies rely on `storage.foldername(name)[1]` (the first path segment) being the owner's `auth.uid()`; ensure uploads use a folder structure like `"{userId}/filename.jpg"`.
- Test policies with sample users in the Supabase Dashboard → SQL Editor or via the Storage UI, and check **Auth → Policies** to confirm behavior.
---

### Run SQL (CLI / psql)

If you prefer the command line or need elevated privileges (service_role), use `psql` or the Supabase CLI to run the files in order:

```bash
# Example (replace connection string with values from your Supabase project)
psql "postgresql://postgres:<DB_PASSWORD>@db.<region>.supabase.co:5432/postgres" -f supabase/sql/tables.sql
psql "postgresql://postgres:<DB_PASSWORD>@db.<region>.supabase.co:5432/postgres" -f supabase/sql/policies.sql
psql "postgresql://postgres:<DB_PASSWORD>@db.<region>.supabase.co:5432/postgres" -f supabase/sql/functions.sql
psql "postgresql://postgres:<DB_PASSWORD>@db.<region>.supabase.co:5432/postgres" -f supabase/sql/triggers.sql
```

If you want a single convenience script that runs everything in order locally, see `supabase/sql/init_db.sql`.

4. Enable Row Level Security (RLS) if not already enabled: the `tables.sql` sets RLS on by default, and `policies.sql` creates the required policies.
5. (Optional) Enable Auth providers (GitHub, Google, Email) under **Authentication → Providers**.
6. Use the **service_role** key on trusted server backends only: never embed it in client code.

> 💡 Tip: The SQL files live under `supabase/sql/` so they can be executed manually or integrated into your migration workflow.

---

## Database Schema

**Overview:** The app uses three primary tables: `profiles`, `listings`, and `escrows`. The SQL scripts that define these tables live under `supabase/sql/`.

### `profiles` (public.profiles)

- `id` uuid NOT NULL
- `address` text
- `created_at` timestamp with time zone NOT NULL DEFAULT timezone('utc', now())

Notes: `id` is expected to map to `auth.uid()` for authorization policies (see `supabase/sql/policies.sql`).

---

### `listings` (public.listings)

- `id` bigint NOT NULL
- `owner_id` uuid NOT NULL DEFAULT auth.uid()
- `title` text NOT NULL
- `description` text NOT NULL
- `price` bigint NOT NULL
- `bedrooms` bigint NOT NULL
- `bathrooms` bigint NOT NULL
- `location` text
- `contact` text
- `image_url` text NOT NULL
- `terms` text NOT NULL
- `created_at` timestamp with time zone NOT NULL DEFAULT now()
- `status` text DEFAULT 'active'

Notes: `owner_id` references `profiles.id` conceptually and RLS policies assume this relationship.

---

### `escrows` (public.escrows)

- `id` bigint NOT NULL
- `listing_id` bigint NOT NULL
- `listing_title` text NOT NULL
- `terms` text NOT NULL
- `dispute_reason` text
- `buyer_address` text NOT NULL
- `seller_address` text NOT NULL
- `arbiter_address` text NOT NULL
- `arbiter_name` text NOT NULL
- `status` text NOT NULL
- `amount` bigint NOT NULL
- `timeout` bigint NOT NULL
- `created_at` timestamp with time zone NOT NULL DEFAULT now()

Notes & recommendations:
- The provided SQL creates these columns and enables RLS but does not set explicit primary key constraints—consider adding PK/index constraints in migrations if you need stronger guarantees or referential integrity.
- `escrows.listing_id` links to `listings.id` and address fields typically correspond to `profiles.address` values.

---

For the full table definitions, see: `supabase/sql/tables.sql` (this README summarizes the current schema).

### Entity diagram

```mermaid
erDiagram
  PROFILES {
    uuid id PK
    text address
    timestamp created_at
  }
  LISTINGS {
    bigint id PK
    uuid owner_id FK
    text title
    text description
    bigint price
    bigint bedrooms
    bigint bathrooms
    text location
    text contact
    text image_url
    text terms
    timestamp created_at
    text status
  }
  ESCROWS {
    bigint id PK
    bigint listing_id FK
    text listing_title
    text terms
    text dispute_reason
    text buyer_address
    text seller_address
    text arbiter_address
    text arbiter_name
    text status
    bigint amount
    bigint timeout
    timestamp created_at
  }
  PROFILES ||--o{ LISTINGS : "owns"
  LISTINGS ||--o{ ESCROWS : "has"
```

---

## ✅ Verify DB & Auth

- Create a test user via Supabase Auth and confirm a `profiles` row is created (the repo includes a `handle_new_user` trigger function to do this).
- Create a listing and an escrow and verify RLS policies behave as expected (try updates/selects with user context in the Dashboard SQL editor or via the client).

### Local testing with Supabase CLI

You can run a local Supabase stack for development and run the SQL files against it:

```bash
# Install the CLI (see https://supabase.com/docs/guides/cli)
npm i -g supabase

# Start local Supabase (API at http://localhost:54321, DB at localhost:54322 by default)
supabase start

# Run the SQL files against the local DB (example)
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/sql/tables.sql
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/sql/policies.sql
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/sql/functions.sql
psql "postgresql://postgres:postgres@localhost:54322/postgres" -f supabase/sql/triggers.sql

# Stop local stack when done
supabase stop
```

---

### Quick Usage Examples

- Faucet (dev only): visit `/faucet` to mint demo MNEE tokens to your connected wallet.

- Using the contract hook in components:

```ts
import { useContract } from "@/hooks/use-contract";

function Example() {
  const { createEscrow, mintMnee } = useContract();

   Create an escrow (example)
   await createEscrow(seller, arbiter, "50", 86400, "terms", "Listing Title", 1, "Arbiter Name");
}
```

## MNEE Integration

- The frontend reads `NEXT_PUBLIC_MNEE_ADDRESS` to locate the MNEE token. Using a stablecoin like MNEE helps keep pricing predictable and enables automated payment/escrow workflows that simplify commerce and financial automation.
- For local development the project includes a faucet to mint mock MNEE (disable on mainnet).
- For production, configure the app to use the MNEE address (`0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`) and verify on-chain behavior before using real funds.
- 

## Security & Notes

- This project **uses mock tokens and addresses by default**.

## License

This project is licensed under the MIT License, see the `LICENSE` file for details.

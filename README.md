# Cuniro

Student-focused rental marketplace & escrow platform using MNEE stablecoin (demo).

Cuniro implements the EscrowManager smart contract [goto EscrowManager->](https://github.com/giantgun/EscrowManager) and uses the MNEE USD‑backed ERC‑20 stablecoin for listings and automated escrow flows. Using a stablecoin like MNEE provides price stability and enables programmable payments and financial automation, making commerce more predictable and simple.

Cuniro is a platform for student housing rentals that uses MNEE for payments and on-chain escrow. It includes a UI for listings, secure escrow creation, a local faucet for minting mock MNEE, and sample integration points for the EscrowManager contract.

## Deploy (fast) ✅

Follow these steps to deploy quickly:

1. Prerequisites
   - Node.js 18+
   - pnpm
   - A Supabase project (See supabase setup for details)

2. Install & build
```bash
pnpm install
pnpm build
```

3. Minimum environment variables
- `NEXT_PUBLIC_MNEE_ADDRESS`
- `NEXT_PUBLIC_ESCROW_MANAGER_ADDRESS`
- `SUPABASE_URL` & `SUPABASE_ANON_KEY`

4. Apply database SQL (Supabase)
Run the SQL files in `supabase/sql/` in order: `tables.sql`, `policies.sql`, `functions.sql`, `triggers.sql` (or use `init_db.sql`).

5. Deploy
- Example (Vercel): add the repository to Vercel, set the environment variables, set the build command to `pnpm build`, then deploy.

See the full **Supabase Setup** and **Deployment** sections below for details and troubleshooting.

## Table of Contents

- [Quick Deploy](#quick-start--deploy-fast-)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Supabase Setup](#supabase-setup)
- [Deployment](#deployment)
- [Database Schema](#database-schema)

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
- ✅ Easy Recovery: Admins can pause or arbitrate when necessary

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- UI: Radix UI primitives
- Blockchain: Ethers.js (interacts with MNEE & EscrowManager contracts)
- Data: Supabase (demo database)
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
## Getting Started

Follow these minimal steps to run locally or prepare for deploy:

1. Prerequisites: Node.js 18+, pnpm (Supabase project required for full features)
2. Install & build:
```bash
pnpm install
```
3. Minimum env vars (create `.env.local`):
- `NEXT_PUBLIC_MNEE_ADDRESS`
- `NEXT_PUBLIC_ESCROW_MANAGER_ADDRESS`: address of a deployed EscrowManager
- `SUPABASE_URL` & `SUPABASE_ANON_KEY` (if using the database)

4. Apply DB schema (if using Supabase): run SQL in `supabase/sql/` or use `supabase/sql/init_db.sql` (see **Supabase Setup** below)

5. Run locally:
```bash
pnpm dev
# visit http://localhost:3000
```

6. Build & run in production:
```bash
pnpm build
pnpm start
```

Helpful scripts:
- `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm format`

Notes:
- Faucet is dev-only (remove or disable for mainnet).
- The **Create Escrow** modal includes a dev/test-only **"add arbiter"** feature and ships with a set of mock arbiters (`defaultArbiters` in `components/create-escrow-modal.tsx`). To disable for production, remove the `showAddArbiterModal` state and its associations, and replace arbiters with trusted arbiters or with a valid arbiter reputation system.
- Ensure `NEXT_PUBLIC_ESCROW_MANAGER_ADDRESS` points to a deployed EscrowManager contract (see **Deployment**).

---

## Supabase Setup

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
   2. `supabase/sql/functions.sql`
   3. `supabase/sql/triggers.sql`
5. Confirm Row Level Security (RLS) is enabled for the tables (the `tables.sql` includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`), and check policies in **Auth / Policies** or run a quick `SELECT` to validate behavior.

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

## Deployment

This project assumes you have completed the **Supabase Setup** above and that EscrowManager is deployed on testnet and mainnet.Supabase is a required dependency for the demo to function (database, RLS policies, and triggers). Follow these deployment recommendations:

- Ensure your Supabase project is created and the SQL files have been applied (`supabase/sql/tables.sql`, `policies.sql`, `functions.sql`, `triggers.sql` or the single `init_db.sql`).
- Configure environment variables on your hosting provider (e.g., Vercel, Netlify, Render):
  - `NEXT_PUBLIC_MNEE_ADDRESS`: MNEE ERC-20 token address
  - `NEXT_PUBLIC_ESCROW_MANAGER_ADDRESS`: Deployed EscrowManager contract address
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`: Supabase project values
  - (Optional server-only) `SUPABASE_SERVICE_ROLE_KEY`: service role key for server-side jobs (never expose to client)
- Deploy the Next.js app (example: Vercel)
  1. Add repository to Vercel and set the environment variables.
  2. Set build command: `pnpm build` and output directory as default for Next.js.
  3. Deploy and monitor logs for build/runtime errors.
- Database migrations & automation: For production, consider running the SQL via Supabase Migrations or a CI job so schema changes are repeatable. The `supabase/sql/init_db.sql` provides a convenience one-shot script, but for repeatable deployments use migrations.

Verification after deployment:
- Create a test user and confirm a `profiles` row is created (the `handle_new_user` trigger should do this).
- Perform a sample escrow flow (mint dev MNEE if needed) and confirm end-to-end behavior.

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

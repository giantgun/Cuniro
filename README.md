# Cuniro

Student-focused rental marketplace & escrow platform using MNEE stablecoin (demo).

Cuniro implements the EscrowManager smart contract (https://github.com/giantgun/EscrowManager) and uses the MNEE USD‑backed ERC‑20 stablecoin for listings and automated escrow flows. Using a stablecoin like MNEE provides price stability and enables programmable payments and financial automation, making commerce more predictable and simple.

Cuniro is a demo marketplace for student rentals that uses MNEE for listing prices and on-chain escrow flows. It includes UI for listings, secure escrow creation, a local faucet for minting mock MNEE, and sample integration points for the EscrowManager contract.

Features

- 🔐 Non-Custodial Escrows — Funds are held in on-chain escrows until release or dispute
- 🧾 Simple Escrow Flows — Create escrows, release funds, raise disputes, and arbitrate
- 💸 Mock MNEE Faucet — Mint demo MNEE tokens locally via the `/faucet` page
- ♿ Accessibility-first UI — Semantic HTML, labels and ARIA where appropriate
- ⚡ Fast Local Dev — Next.js + Tailwind + Supabase for quick iteration

Non-Custodial Architecture

This demo enforces escrow logic on-chain using the EscrowManager smart contract (https://github.com/giantgun/EscrowManager). Payments are done using MNEE, a USD‑backed ERC‑20 stablecoin—this gives price stability and enables programmable, automated payments and escrow workflows that simplify commerce and financial automation. The app never holds user funds directly — users approve the escrow contract to transfer MNEE from their wallets.

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
│                          MNEE ERC20                          │
│  - USD-backed stablecoin used for payments and automated     │
│    escrow flows (enables predictable pricing & automation)   │
└─────────────────────────────────────────────────────────────┘

Why Non-Custodial Matters

- ✅ You Own Your Funds — Tokens remain in user wallets / approved contracts
- ✅ On-Chain Guarantees — Escrow rules are executed by smart contracts
- ✅ Transparent Audit Trail — All actions are visible on-chain
- ✅ Easy Recovery — Admins can pause or arbitrate when necessary

Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- UI: Radix UI primitives
- Blockchain: Ethers.js (interacts with MNEE & EscrowManager contracts)
- Data: Supabase (demo database)
- Tooling: pnpm, Prettier, ESLint

Project Structure

├── app/                   # Next.js app router pages
├── components/            # React components & modals
├── components/ui/         # Design system components (Radix + Tailwind)
├── hooks/                 # Hooks (use-contract, use-wallet, supabase helpers)
├── lib/                   # Utilities
├── public/                # Static assets
├── styles/                # Global styles

Getting Started

Prerequisites

- Node.js 18+
- pnpm

Install dependencies

```bash
pnpm install
```

Run the dev server

```bash
pnpm dev
```

Build for production

```bash
pnpm build
```

Useful Scripts

- `pnpm dev` — Run Next.js in development
- `pnpm build` — Build for production
- `pnpm start` — Start a built Next.js server
- `pnpm lint` — Run ESLint
- `pnpm format` — Format with Prettier

Environment Variables

Create a `.env.local` (or use `.env`) in the repo root with at least:

- `NEXT_PUBLIC_MNEE_ADDRESS` — The MNEE ERC20 token address (demo or mainnet)
- `NEXT_PUBLIC_ESCROW_MANAGER_ADDRESS` — Deployed EscrowManager contract address
- `SUPABASE_URL` & `SUPABASE_ANON_KEY` — Supabase demo project keys (optional)

Note: This repo ships with a demo MNEE address in `.env`. For mainnet testing replace `NEXT_PUBLIC_MNEE_ADDRESS` with a real MNEE contract address.

---

## Supabase Setup

Follow these steps to create and configure a Supabase project for this app.

1. Create a Supabase account at https://supabase.com and create a new **Project** (select a region and set a strong DB password).
2. From **Project → Settings → API**, copy your **SUPABASE_URL**, **anon** key and **service_role** key. Keep the `service_role` secret (server-only).

### Run SQL (Dashboard / UI) — recommended for most users

This project includes SQL scripts in `supabase/sql/`. The easiest way to apply them is via the Supabase **Dashboard → SQL Editor**:

1. Open your Supabase Project and go to **SQL → SQL Editor**.
2. Click **New query**.
3. Paste the contents of `supabase/sql/tables.sql` into the editor and click **Run**. Verify the tables appear under **Table Editor → public**.
4. Repeat for the remaining files in this exact order:
   1. `supabase/sql/policies.sql`
   2. `supabase/sql/functions.sql`
   3. `supabase/sql/triggers.sql`
5. Confirm Row Level Security (RLS) is enabled for the tables (the `tables.sql` includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`), and check policies in **Auth / Policies** or run a quick `SELECT` to validate behavior.

Notes & edge cases (UI):
- If you need to create triggers or objects in the `auth` schema (for example, a trigger on `auth.users` to populate `profiles`), the Dashboard SQL editor may restrict some operations for non-privileged roles. If you encounter permission errors when creating `auth`-schema triggers, use the CLI/psql option below with your `service_role` key (server-side) to run the SQL.
- The SQL Editor doesn't have a built-in "run a .sql file" button in all accounts; copy-paste is the most reliable UI method. Some accounts may offer an import/upload option — use it if available.

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

4. Enable Row Level Security (RLS) if not already enabled — the `tables.sql` sets RLS on by default, and `policies.sql` creates the required policies.
5. (Optional) Enable Auth providers (GitHub, Google, Email) under **Authentication → Providers**.
6. Use the **service_role** key on trusted server backends only — never embed it in client code.

> 💡 Tip: The SQL files live under `supabase/sql/` so they can be executed manually or integrated into your migration workflow.

---

## Deployment

This project assumes you have completed the **Supabase Setup** above — Supabase is a required dependency for the demo to function (database, RLS policies, and triggers). Follow these deployment recommendations:

- Ensure your Supabase project is created and the SQL files have been applied (`supabase/sql/tables.sql`, `policies.sql`, `functions.sql`, `triggers.sql` or the single `init_db.sql`).
- Configure environment variables on your hosting provider (e.g., Vercel, Netlify, Render):
  - `NEXT_PUBLIC_MNEE_ADDRESS` — MNEE ERC-20 token address
  - `NEXT_PUBLIC_ESCROW_MANAGER_ADDRESS` — Deployed EscrowManager contract address
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` — Supabase project values
  - (Optional server-only) `SUPABASE_SERVICE_ROLE_KEY` — service role key for server-side jobs (never expose to client)
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

**Overview:** The app uses three primary tables:

- `profiles` — stores user profile data (mapped by `id` = `auth.uid()` and `address`).
- `listings` — rental listings created by users; `owner_id` references `profiles.id`.
- `escrows` — escrow records for a listing; references `listing_id` and stores `buyer_address`, `seller_address`, `arbiter_address` (addresses correspond to `profiles.address`).

**Relationships & notes:**
- `profiles.id` is a UUID (`auth.uid()`), used for authorization policies.
- `escrows.listing_id` links to `listings.id` (ensure this column name is correct for your dataset).
- RLS policies are applied to each table — see `supabase/sql/policies.sql` for details.

### Entity diagram (Mermaid)

```mermaid
erDiagram
  PROFILES {
    uuid id PK
    text address
  }
  LISTINGS {
    bigint id PK
    uuid owner_id FK
    text title
    text description
    bigint price
    text status
  }
  ESCROWS {
    bigint id PK
    bigint listing_id FK
    text buyer_address
    text seller_address
    text arbiter_address
    text status
    bigint amount
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

Quick Usage Examples

- Faucet (dev only): visit `/faucet` to mint demo MNEE tokens to your connected wallet.

- Using the contract hook in components:

```ts
import { useContract } from "@/hooks/use-contract";

function Example() {
  const { createEscrow, mintMnee } = useContract();

  // Mint 100k mock MNEE (dev only)
  // await mintMnee(yourAddress);

  // Create an escrow (example)
  // await createEscrow(seller, arbiter, "50", 86400, "terms", "Listing Title", 1, "Arbiter Name");
}
```

MNEE Integration

- The frontend reads `NEXT_PUBLIC_MNEE_ADDRESS` to locate the MNEE token. Using a stablecoin like MNEE helps keep pricing predictable and enables automated payment/escrow workflows that simplify commerce and financial automation.
- For local development the project includes a faucet to mint mock MNEE.
- For production, configure the app to use a proper stablecoin contract address (or the canonical MNEE address) and verify on-chain behavior before using real funds.

Security & Notes

- This project is a demo and **uses mock tokens and addresses by default** — do not use demo keys or addresses with real funds.
- Always review contract addresses before sending real tokens.

Contributing

Contributions welcome — open an issue or submit a PR. Keep changes focused and add tests where applicable.

License

This project is licensed under the MIT License — see the `LICENSE` file for details.

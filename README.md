# Cuniro

Student-focused rental marketplace & escrow platform using MNEE stablecoin (demo).

Cuniro is a demo marketplace for student rentals that uses MNEE (USD-backed ERC20) for listing prices and on-chain escrow flows. It includes UI for listings, secure escrow creation, a local faucet for minting mock MNEE, and sample integration points for a non-custodial escrow manager contract.

Features

- 🔐 Non-Custodial Escrows — Funds are held in on-chain escrows until release or dispute
- 🧾 Simple Escrow Flows — Create escrows, release funds, raise disputes, and arbitrate
- 💸 Mock MNEE Faucet — Mint demo MNEE tokens locally via the `/faucet` page
- ♿ Accessibility-first UI — Semantic HTML, labels and ARIA where appropriate
- ⚡ Fast Local Dev — Next.js + Tailwind + Supabase for quick iteration

Non-Custodial Architecture

This demo enforces escrow logic on-chain (via an EscrowManager contract) and uses an ERC20 MNEE token for value transfer. The app never holds user funds directly — users approve the escrow contract to transfer MNEE from their wallets.

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
│  - USD-backed (demo/mainnet) token used for payments         │
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

- The frontend reads `NEXT_PUBLIC_MNEE_ADDRESS` to locate the MNEE token.
- For local development the project includes a faucet to mint mock MNEE.
- For production, configure the app to use a proper stablecoin contract address.

Security & Notes

- This project is a demo and **uses mock tokens and addresses by default** — do not use demo keys or addresses with real funds.
- Always review contract addresses before sending real tokens.

Contributing

Contributions welcome — open an issue or submit a PR. Keep changes focused and add tests where applicable.

License

This project is licensed under the MIT License — see the `LICENSE` file for details.

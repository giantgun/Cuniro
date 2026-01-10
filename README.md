# Cuniro

**Cuniro** is a student-focused rental marketplace built with Next.js and TypeScript. It provides tools to list properties, create/manage escrows, and browse rentals with a modern, accessible UI.

> ⚠️ Important: This app was built and tested using a _mock mnee address_ for demonstration purposes. Do not use the mock address for production or real funds.

---

## Features ✅

- Create, edit, and manage property listings
- Secure escrow creation and management (demo flows)
- Connect wallet (mock/test wallet flows supported)
- Accessible UI components and modals (aria attributes, proper labels)
- Responsive design and mobile support

---

## Accessibility & Notes 🔧

Accessibility is a priority in this project. The UI uses semantic HTML, labeled form elements, and ARIA attributes where appropriate. If you find any accessibility issues or have suggestions, please open an issue or submit a PR.

---

## Tech Stack

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Supabase (for demo data)
- Ethers (for blockchain interactions)

---

## Getting Started (Local Development) 💻

Prerequisites:

- Node.js (>= 18)
- pnpm (recommended)

Install dependencies:

```bash
pnpm install
```

Run development server:

```bash
pnpm dev
```

Build:

```bash
pnpm build
```

Format code:

```bash
pnpm format
```

Lint:

```bash
pnpm lint
```

---

## Configuration

- Environment variables (if needed) should be added to a `.env.local` file. This project uses Supabase and can be configured with SUPABASE_URL and SUPABASE_ANON_KEY for local data.

---

## Contributing 🤝

Contributions are welcome. Please open an issue to discuss major changes or submit a pull request. Keep changes focused and add tests where applicable.

---

## Security & Privacy

This demo uses mock data and addresses. Never use demo or mock addresses, keys, or credentials with real funds or in production.

---

## License 📄

This project is licensed under the MIT License - see the `LICENSE` file for details.

# Spending Insights

EUR bookkeeping with PostgreSQL, a web app, and an MCP server. Bank accounts,
investments, debts, people, and spending categories share a double-entry ledger.
Investments track contributions and withdrawals, without market valuations.

## Development

```bash
pnpm install
cp .env.example .env.local
```

Set a random `BETTER_AUTH_SECRET` of at least 32 characters and
`ENABLE_DEV_LOGIN=true` in `.env.local`. With Docker and Docker Compose installed,
start PostgreSQL in the background:

```bash
pnpm db:start
```

Then run:

```bash
pnpm db:migrate
pnpm db:seed # optional fictional data for the local developer
pnpm dev
```

Open http://localhost:3000 and use the local development login. This login only
exists in development mode, requires the explicit flag, and accepts a localhost
origin. The `DATABASE_URL` in `.env.example` matches the container. Data is stored
in a Docker volume. Stop PostgreSQL without deleting data:

```bash
pnpm db:stop
```

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Tests use isolated users in the configured development database and remove them
when finished. Keep PostgreSQL running for tests.

## Google sign-in

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_URL`,
`BETTER_AUTH_SECRET`, and `DATABASE_URL`. Register
`<BETTER_AUTH_URL>/api/auth/callback/google` as the Google redirect URI.
Production uses Google only. `pnpm start` applies pending migrations before
starting the app.

## Import and booking

Download the CSV template from Transactions. Its columns are:

```csv
id,account,date,amount,currency,description,counterparty,reference
```

Use account keys, stable transaction IDs, ISO dates, decimal amounts and `EUR`.
Positive amounts increase assets or reduce liabilities; negatives do the reverse.
Identical IDs within an account are skipped; conflicting data rejects the import.

Imports remain unbooked until manually booked or processed with rules. Reports
exclude unbooked imports. Select both transfer sides together, or link a later
import to an existing booking. A booking uses one date for all its postings.

## Agent access

Create a token in Agent access. Connect a Streamable HTTP MCP client to `/api/mcp`
with `Authorization: Bearer <token>`. Tokens expire after one year and can be
revoked. The UI and MCP share the operations in `lib/ledger/commands.ts`.

The same endpoint supports MCP 2026-07-28 and legacy 2025 protocols. Clients
select the protocol automatically according to their supported versions and
settings. Both use the same tokens and tools, with no server-side MCP sessions.

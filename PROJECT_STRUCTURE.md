# AgentPay — Project Structure

> Micropayment and autonomous billing protocol for AI agents on 0G Chain.

**Last updated:** March 31, 2026
**Monorepo manager:** pnpm workspaces
**Build orchestration:** Turborepo

This is a pnpm monorepo. All packages and applications live under `packages/` and `apps/` respectively. Turborepo handles task orchestration, caching, and dependency-aware builds across the workspace.

---

## Complete Directory Tree

```
AgentPay/
│
├── package.json                        # Root package.json — workspace config, shared scripts, devDependency hoisting
├── pnpm-workspace.yaml                 # Defines workspace packages: packages/* and apps/*
├── pnpm-lock.yaml                      # Lockfile — committed to version control
├── turbo.json                          # Turborepo pipeline config — build, test, lint, dev task definitions and caching
├── biome.json                          # Biome config — linting and formatting rules (replaces ESLint + Prettier)
├── .env.example                        # Template for all required environment variables with descriptions
├── docker-compose.yml                  # Local dev services: PostgreSQL 16 + Redis 7
├── README.md                           # Project overview, architecture, usage guide, hackathon submission info
├── PROJECT_STRUCTURE.md                # This file — annotated directory tree and architectural decisions
├── CONTRIBUTING.md                     # Contribution guidelines, PR process, branch naming, commit conventions
├── CHANGELOG.md                        # Version history managed by Changesets
├── LICENSE                             # MIT License
├── .gitignore                          # Ignores: node_modules, dist, .env, coverage, typechain-types, .turbo
├── .npmrc                              # pnpm config — strict peer dependencies, hoist patterns
├── .changeset/                         # Changesets config and pending changeset files
│   └── config.json                     # Changesets configuration — versioning strategy, changelog format
│
├── packages/
│   │
│   ├── contracts/                      # Solidity smart contracts — Hardhat monorepo package
│   │   ├── package.json                # Package: @agentpay/contracts — Hardhat, OpenZeppelin, ethers.js v6
│   │   ├── hardhat.config.ts           # Hardhat config — Solidity 0.8.24, 0G Chain network (mainnet + testnet), gas reporter, typechain
│   │   ├── tsconfig.json               # TypeScript config for Hardhat scripts and tests
│   │   │
│   │   ├── contracts/
│   │   │   ├── core/
│   │   │   │   ├── AgentRegistry.sol   # Agent registration — 0G Agent ID binding, service catalog, identity verification, agent metadata
│   │   │   │   ├── PaymentRouter.sol   # Payment engine — direct pay, escrow creation, conditional release, cancellation, fee deduction
│   │   │   │   └── SplitVault.sol      # Revenue distribution — multi-party splits with basis-point precision, withdrawal, reconfig
│   │   │   │
│   │   │   ├── interfaces/
│   │   │   │   ├── IAgentRegistry.sol  # Interface for AgentRegistry — used by PaymentRouter and SplitVault for cross-contract calls
│   │   │   │   ├── IPaymentRouter.sol  # Interface for PaymentRouter — used by external integrators and the SDK
│   │   │   │   └── ISplitVault.sol     # Interface for SplitVault — used by PaymentRouter when routing through splits
│   │   │   │
│   │   │   ├── libraries/
│   │   │   │   ├── PaymentLib.sol      # Fee calculation logic, payment amount validation, escrow timeout math
│   │   │   │   └── AgentLib.sol        # 0G Agent ID verification helpers, address resolution, registration data validation
│   │   │   │
│   │   │   └── mocks/
│   │   │       ├── MockAgentID.sol     # Mock 0G Agent ID contract for local testing without 0G infrastructure
│   │   │       ├── MockERC20.sol       # Mock ERC-20 token for payment testing
│   │   │       └── MockOracle.sol      # Mock pricing oracle returning fixed prices for deterministic test scenarios
│   │   │
│   │   ├── ignition/
│   │   │   └── modules/
│   │   │       ├── AgentRegistry.ts    # Hardhat Ignition module — deploys AgentRegistry with 0G Agent ID contract address param
│   │   │       ├── PaymentRouter.ts    # Hardhat Ignition module — deploys PaymentRouter, links to AgentRegistry
│   │   │       ├── SplitVault.ts       # Hardhat Ignition module — deploys SplitVault, links to PaymentRouter
│   │   │       └── FullDeploy.ts       # Hardhat Ignition module — orchestrates full protocol deployment in correct order
│   │   │
│   │   ├── test/
│   │   │   ├── AgentRegistry.test.ts   # Unit tests — registration, lookup, deactivation, 0G Agent ID binding validation
│   │   │   ├── PaymentRouter.test.ts   # Unit tests — direct pay, escrow lifecycle, conditional release, cancel, edge cases
│   │   │   ├── SplitVault.test.ts      # Unit tests — split config, distribution math, withdrawal, multi-token support
│   │   │   ├── integration.test.ts     # Integration tests — full payment flow across all three contracts
│   │   │   └── helpers/
│   │   │       ├── fixtures.ts         # Shared test fixtures — deployed contract instances, funded accounts
│   │   │       └── constants.ts        # Test constants — mock agent IDs, default amounts, token addresses
│   │   │
│   │   └── typechain-types/            # Auto-generated TypeScript types from compiled contract ABIs (gitignored, built on compile)
│   │
│   └── sdk/                            # TypeScript SDK — @agentpay/sdk npm package
│       ├── package.json                # Package: @agentpay/sdk — viem v2, zod, 0G Storage SDK, 0G Compute SDK, 0G Agent ID SDK
│       ├── tsconfig.json               # TypeScript 5.4+ strict config, path aliases
│       ├── tsup.config.ts              # tsup bundler config — outputs CJS + ESM, generates .d.ts, entry: src/index.ts
│       ├── vitest.config.ts            # Vitest config — test environment, coverage thresholds, mock setup
│       │
│       └── src/
│           ├── index.ts                # Public API barrel export — AgentPayClient, types, utilities
│           ├── client.ts               # AgentPayClient class — initialization with RPC url, wallet, contract addresses, 0G endpoints
│           │
│           ├── modules/
│           │   ├── registry.ts         # Agent registration, lookup by ID, service catalog queries, identity verification
│           │   ├── payments.ts         # Direct pay, escrow creation, release with proof, cancel, payment status queries
│           │   ├── splits.ts           # SplitVault configuration, distribution execution, balance queries, withdrawal
│           │   ├── storage.ts          # 0G Storage integration — write invoices, read payment history, query audit logs
│           │   └── oracle.ts           # 0G Compute integration — submit pricing requests, parse price recommendations
│           │
│           ├── types/
│           │   ├── agent.ts            # Agent types — AgentProfile, ServiceCatalogEntry, RegistrationParams
│           │   ├── payment.ts          # Payment types — PaymentRequest, EscrowRecord, EscrowStatus, ReleaseProof
│           │   ├── split.ts            # Split types — SplitConfig, SplitRecipient, DistributionRecord
│           │   ├── invoice.ts          # Invoice types — Invoice, InvoiceLineItem, InvoiceQuery, InvoiceFilter
│           │   ├── oracle.ts           # Oracle types — PricingRequest, PricingResponse, PriceRange
│           │   └── schemas.ts          # Zod schemas for runtime validation of all input types
│           │
│           ├── utils/
│           │   ├── addresses.ts        # Address validation, checksumming, 0G Agent ID format helpers
│           │   ├── amounts.ts          # Token amount formatting, wei conversion, basis-point math
│           │   ├── errors.ts           # Custom error classes — AgentPayError, EscrowNotFoundError, OracleTimeoutError
│           │   └── constants.ts        # Contract addresses, default gas limits, supported chain IDs
│           │
│           ├── abis/
│           │   ├── AgentRegistry.json  # Compiled ABI for AgentRegistry — copied from contracts build output
│           │   ├── PaymentRouter.json  # Compiled ABI for PaymentRouter
│           │   └── SplitVault.json     # Compiled ABI for SplitVault
│           │
│           └── __tests__/
│               ├── client.test.ts      # Client initialization, config validation, connection tests
│               ├── registry.test.ts    # Registry module unit tests with mocked contract calls
│               ├── payments.test.ts    # Payments module unit tests — escrow lifecycle mocking
│               ├── splits.test.ts      # Splits module unit tests — distribution math verification
│               ├── storage.test.ts     # Storage module tests with mocked 0G Storage SDK
│               └── oracle.test.ts      # Oracle module tests with mocked 0G Compute responses
│
├── apps/
│   │
│   ├── api/                            # Hono.js REST API backend
│   │   ├── package.json                # Package: @agentpay/api — hono, drizzle-orm, pg, redis, @agentpay/sdk
│   │   ├── tsconfig.json               # TypeScript config — strict, NodeNext module resolution
│   │   ├── vitest.config.ts            # Vitest config for API route and service tests
│   │   ├── Dockerfile                  # Production container image — Node.js 20 Alpine, multi-stage build
│   │   │
│   │   └── src/
│   │       ├── index.ts                # App entry point — Hono app creation, middleware registration, route mounting, server start
│   │       │
│   │       ├── routes/
│   │       │   ├── agents.ts           # POST /agents (register), GET /agents/:id (profile), PATCH /agents/:id (update catalog)
│   │       │   ├── payments.ts         # POST /payments (initiate), GET /payments/:id (status), GET /payments (list with filters)
│   │       │   ├── invoices.ts         # GET /invoices (list), GET /invoices/:id (detail), POST /invoices/sync (trigger 0G Storage sync)
│   │       │   └── oracle.ts           # POST /oracle/price (pricing request proxy to 0G Compute), GET /oracle/history (past prices)
│   │       │
│   │       ├── services/
│   │       │   ├── AgentService.ts     # Agent registration logic — validates input, calls SDK registry module, persists to DB
│   │       │   ├── PaymentService.ts   # Payment orchestration — escrow creation, release verification, status tracking
│   │       │   ├── StorageService.ts   # 0G Storage operations — write invoice records, read history, sync on-chain events to storage
│   │       │   └── OracleService.ts    # Oracle proxy — formats pricing requests, calls 0G Compute, caches recent prices in Redis
│   │       │
│   │       ├── db/
│   │       │   ├── index.ts            # Drizzle ORM client initialization — PostgreSQL connection via pg driver
│   │       │   ├── schema.ts           # Drizzle schema — agents, payments, escrows, invoices, oracle_prices tables
│   │       │   └── migrations/         # SQL migration files generated by drizzle-kit
│   │       │       └── 0001_initial.sql# Initial schema migration — creates all core tables and indexes
│   │       │
│   │       ├── middleware/
│   │       │   ├── auth.ts             # API key authentication middleware — validates agent API keys from request headers
│   │       │   ├── rateLimit.ts        # Rate limiting middleware — Redis-backed sliding window, per-agent limits
│   │       │   └── errorHandler.ts     # Global error handler — catches exceptions, returns structured JSON error responses
│   │       │
│   │       └── lib/
│   │           ├── agentpay.ts         # Singleton AgentPay SDK client instance — configured from environment variables
│   │           ├── redis.ts            # Redis client initialization — connection config, retry logic
│   │           ├── zgStorage.ts        # 0G Storage SDK client — configured with storage endpoint from env
│   │           ├── zgCompute.ts        # 0G Compute SDK client — configured with compute endpoint from env
│   │           └── config.ts           # Environment variable parsing and validation via Zod
│   │
│   ├── web/                            # Next.js 14 frontend — App Router
│   │   ├── package.json                # Package: @agentpay/web — next 14, tailwindcss, wagmi v2, viem v2, @tanstack/react-query v5
│   │   ├── next.config.ts              # Next.js config — env vars, image domains, experimental flags
│   │   ├── tailwind.config.ts          # Tailwind CSS config — custom theme, shadcn/ui preset
│   │   ├── tsconfig.json               # TypeScript config — strict, JSX preserve, path aliases (@/)
│   │   ├── postcss.config.js           # PostCSS config — Tailwind CSS plugin
│   │   ├── components.json             # shadcn/ui config — component paths, style preferences
│   │   │
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout — providers (wagmi, query client, theme), global styles, font loading
│   │   │   ├── page.tsx                # Landing page — hero, feature overview, call-to-action to connect wallet
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx            # Dashboard home — payment volume summary, recent transactions, agent status
│   │   │   │   └── layout.tsx          # Dashboard layout — sidebar navigation, header with wallet connection
│   │   │   ├── agents/
│   │   │   │   ├── page.tsx            # Agent directory — browse registered agents, filter by service type
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Agent detail — profile, service catalog, payment history with this agent
│   │   │   ├── payments/
│   │   │   │   ├── page.tsx            # Payment list — filterable table of all payments (sent, received, escrowed)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # New payment form — select recipient, amount, escrow options, oracle pricing
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Payment detail — status, escrow timeline, split breakdown, invoice link
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx            # Invoice list — all invoices with status filters, date range, export
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Invoice detail — full line items, 0G Storage proof, download
│   │   │   └── api/
│   │   │       └── [...proxy]/
│   │   │           └── route.ts        # API proxy route — forwards client-side requests to the Hono backend
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn/ui primitives — button, card, table, dialog, dropdown, input, badge, etc.
│   │   │   ├── features/
│   │   │   │   ├── PaymentCard.tsx     # Payment summary card — amount, status badge, counterparty, timestamp
│   │   │   │   ├── AgentProfile.tsx    # Agent profile display — name, ID, services, reputation score, wallet address
│   │   │   │   ├── InvoiceFeed.tsx     # Real-time invoice feed — streaming list of recent invoices with auto-refresh
│   │   │   │   ├── EscrowTimeline.tsx  # Escrow status timeline — visual step indicator (locked → released / cancelled)
│   │   │   │   ├── SplitBreakdown.tsx  # Revenue split visualization — pie chart or bar showing recipient percentages
│   │   │   │   ├── OraclePriceCard.tsx # Oracle price display — recommended price, range, confidence, refresh button
│   │   │   │   └── WalletConnect.tsx   # Wallet connection component — wagmi connector modal, chain switching
│   │   │   └── layouts/
│   │   │       ├── Sidebar.tsx         # Dashboard sidebar — navigation links, agent status indicator
│   │   │       └── Header.tsx          # Dashboard header — wallet status, notifications, settings
│   │   │
│   │   ├── lib/
│   │   │   ├── wagmi.ts               # wagmi v2 config — 0G Chain definition, connectors (injected, WalletConnect)
│   │   │   ├── viem.ts                # viem public and wallet client setup — 0G Chain transport config
│   │   │   ├── query.ts               # TanStack Query client — default options, cache time, refetch intervals
│   │   │   └── agentpay.ts            # Browser-side AgentPay SDK initialization — reads config from env
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAgentPay.ts          # Core hook — returns initialized SDK client, connection status, current agent
│   │   │   ├── usePaymentHistory.ts    # Fetches paginated payment history via TanStack Query + SDK storage module
│   │   │   ├── useOraclePrice.ts       # Fetches oracle pricing for a given service — debounced, with loading/error states
│   │   │   ├── useEscrowStatus.ts      # Polls escrow status by ID — returns current state and timeline events
│   │   │   └── useAgentRegistry.ts     # Agent search and lookup — registry queries with TanStack Query caching
│   │   │
│   │   └── public/
│   │       ├── logo.svg                # AgentPay logo
│   │       └── og-image.png            # Open Graph image for social media previews
│   │
│   └── demo/                           # Standalone demo scripts — used for hackathon presentation and judge testing
│       ├── package.json                # Package: @agentpay/demo — @agentpay/sdk, tsx for TypeScript execution
│       ├── tsconfig.json               # TypeScript config — NodeNext, strict
│       │
│       └── src/
│           ├── index.ts                # Demo runner — CLI menu to select and execute scenarios
│           └── scenarios/
│               ├── agent-registration.ts    # Registers two agents with 0G Agent ID binding and service catalogs
│               ├── simple-payment.ts        # Agent A pays Agent B directly — no escrow, instant settlement
│               ├── escrow-payment.ts        # Full escrow flow — lock, job execution simulation, conditional release
│               ├── revenue-split.ts         # Configures a 3-way split, routes a payment through it, shows distribution
│               ├── oracle-pricing.ts        # Calls the pricing oracle for a service, displays recommended price range
│               └── full-workflow.ts         # End-to-end: register → oracle price → escrow → execute → settle → split → invoice
│
├── docs/                               # Project documentation
│   ├── architecture.md                 # System design — three-layer architecture, data flow, component interaction diagrams
│   ├── contracts.md                    # Contract reference — every function, parameter, event, with plain English descriptions
│   ├── sdk-reference.md               # SDK method reference — every public method, params, return types, usage notes
│   ├── 0g-integration.md              # Detailed guide for each 0G component integration — Chain, Storage, Compute, Agent ID
│   └── deployment.md                  # Step-by-step mainnet deployment — contract deployment, verification, SDK config
│
├── scripts/                            # Utility and operational scripts
│   ├── seed-agents.ts                  # Seeds test agents into the registry on a target network
│   ├── verify-contracts.ts             # Runs contract verification on 0G block explorer
│   └── sync-abis.ts                    # Copies compiled ABIs from contracts/typechain-types to sdk/src/abis
│
└── .github/
    └── workflows/
        ├── ci.yml                      # PR pipeline — install, lint (Biome), test (all packages), build (all packages), typecheck
        ├── deploy-contracts.yml        # Manual trigger — deploys contracts to 0G mainnet via Hardhat Ignition
        └── publish-sdk.yml             # Triggered on release tag — builds SDK, publishes @agentpay/sdk to npm
```

---

## Environment Variables Reference

All variables are documented in `.env.example`. Copy it to `.env` and fill in the values.

| Variable | Description | Required | Example |
|---|---|---|---|
| `ZG_RPC_URL` | 0G Chain JSON-RPC endpoint (mainnet or testnet) | Yes | `https://rpc.0g.ai` |
| `ZG_CHAIN_ID` | 0G Chain network ID | Yes | `16600` |
| `ZG_STORAGE_ENDPOINT` | 0G Storage node URL for invoice and history persistence | Yes | `https://storage.0g.ai` |
| `ZG_COMPUTE_ENDPOINT` | 0G Compute service URL for pricing oracle inference | Yes | `https://compute.0g.ai` |
| `ZG_AGENT_ID` | Deployer/operator agent's 0G Agent ID | Yes | `0g-agent-abc123...` |
| `DEPLOYER_PRIVATE_KEY` | Private key for contract deployment transactions | Yes | `0xabcdef...` |
| `AGENT_REGISTRY_ADDRESS` | Deployed AgentRegistry contract address | After deploy | `0x1234...` |
| `PAYMENT_ROUTER_ADDRESS` | Deployed PaymentRouter contract address | After deploy | `0x5678...` |
| `SPLIT_VAULT_ADDRESS` | Deployed SplitVault contract address | After deploy | `0x9abc...` |
| `DATABASE_URL` | PostgreSQL connection string for the API backend | Yes (API) | `postgresql://user:pass@localhost:5432/agentpay` |
| `REDIS_URL` | Redis connection string for caching and rate limiting | Yes (API) | `redis://localhost:6379` |
| `API_PORT` | Port for the Hono.js API server | No (default: 3001) | `3001` |
| `NEXT_PUBLIC_API_URL` | Public URL of the API backend (used by frontend) | Yes (Web) | `http://localhost:3001` |
| `NEXT_PUBLIC_ZG_RPC_URL` | 0G Chain RPC URL exposed to the browser (public) | Yes (Web) | `https://rpc.0g.ai` |
| `NEXT_PUBLIC_ZG_CHAIN_ID` | 0G Chain ID exposed to the browser | Yes (Web) | `16600` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID for wallet connections | No | `wc_project_abc...` |

---

## Monorepo Task Reference

All commands are run from the repository root. Turborepo handles dependency ordering and caching.

| Command | Scope | Description |
|---|---|---|
| `pnpm install` | Root | Install all workspace dependencies |
| `pnpm build` | All packages | Build everything: contracts compile → SDK bundle → API build → Web build |
| `pnpm test` | All packages | Run all tests: contract tests (Hardhat) → SDK tests (Vitest) → API tests (Vitest) → E2E (Playwright) |
| `pnpm lint` | All packages | Lint and format-check all code with Biome |
| `pnpm lint:fix` | All packages | Auto-fix linting and formatting issues |
| `pnpm dev` | Apps only | Start development servers: API (port 3001) + Web (port 3000) in parallel |
| `pnpm typecheck` | All packages | Run TypeScript type checking across all packages |
| `pnpm contracts:compile` | contracts | Compile Solidity contracts with Hardhat |
| `pnpm contracts:test` | contracts | Run contract unit and integration tests |
| `pnpm contracts:deploy` | contracts | Deploy contracts to 0G Chain via Hardhat Ignition (uses `DEPLOYER_PRIVATE_KEY`) |
| `pnpm contracts:verify` | contracts | Verify deployed contracts on 0G block explorer |
| `pnpm sdk:build` | sdk | Build SDK — outputs CJS + ESM to `dist/` |
| `pnpm sdk:test` | sdk | Run SDK unit tests with Vitest |
| `pnpm api:dev` | api | Start API server in development mode with hot reload |
| `pnpm api:test` | api | Run API route and service tests |
| `pnpm web:dev` | web | Start Next.js dev server on port 3000 |
| `pnpm web:build` | web | Production build of the Next.js frontend |
| `pnpm demo:run` | demo | Launch the interactive demo scenario runner |
| `pnpm db:migrate` | api | Run Drizzle ORM database migrations |
| `pnpm db:generate` | api | Generate migration files from schema changes |
| `pnpm sync:abis` | scripts | Copy compiled ABIs from contracts to SDK package |
| `pnpm changeset` | Root | Create a new changeset for versioning |
| `pnpm changeset:version` | Root | Apply changesets and bump package versions |

---

## Inter-Package Dependency Map

```
┌──────────────────────────────────────────────────────┐
│                    apps/web                           │
│                  (Next.js 14)                         │
│                       │                              │
│                       │ imports                      │
│                       ▼                              │
│  apps/api ────────► packages/sdk ◄──── apps/demo    │
│  (Hono.js)    imports  (TypeScript)  imports         │
│                       │                              │
│                       │ imports ABIs                 │
│                       ▼                              │
│               packages/contracts                     │
│                 (Hardhat / Solidity)                  │
└──────────────────────────────────────────────────────┘
```

**Dependency details:**

| Consumer | Depends On | What It Uses |
|---|---|---|
| `apps/web` | `packages/sdk` | SDK client, types, hooks wrap SDK methods |
| `apps/api` | `packages/sdk` | SDK client for on-chain operations inside API services |
| `apps/demo` | `packages/sdk` | SDK client for running demo scenarios |
| `packages/sdk` | `packages/contracts` | Compiled ABI JSON files (copied via `sync:abis` script) |
| `apps/web` | `apps/api` | Runtime HTTP dependency (not a package dependency) — frontend calls API endpoints |

The `packages/contracts` package has no internal dependencies — it is the leaf node. Changes to contracts trigger a rebuild chain: contracts → sdk → api + web + demo.

---

## Key Architectural Decisions

### Why pnpm workspaces + Turborepo over a single-package repo

AgentPay has four distinct deployment targets: contracts deploy to a blockchain, the SDK publishes to npm, the API deploys as a server, and the frontend deploys as a static site. A monorepo with explicit package boundaries enforces clean interfaces between these concerns. Turborepo gives us incremental builds with remote caching — when only the frontend changes, contracts and SDK tests don't re-run. pnpm's strict node_modules structure (no phantom dependencies) catches real dependency issues before they reach production.

A single-package repo would conflate contract tooling (Hardhat, Solidity compiler) with frontend tooling (Next.js, Tailwind) in one dependency tree. That creates slow installs, confusing configs, and circular dependency risks. The workspace approach keeps each concern isolated while still allowing same-repo imports.

### Why viem v2 over ethers.js in the SDK (while Hardhat still uses ethers internally)

The SDK uses viem v2 for all blockchain interactions because of its strict TypeScript types, tree-shakeable architecture, and smaller bundle size. When a developer imports `@agentpay/sdk` into their application, they get type-safe contract reads and writes with ABI-level type inference — function parameters and return types are derived from the ABI at compile time, eliminating an entire class of runtime errors.

Hardhat still uses ethers.js v6 internally because the Hardhat plugin ecosystem (testing utilities, gas reporter, coverage) is built around ethers. This is standard practice — Hardhat handles the contract development lifecycle, whereas viem handles the production client. The two never interact at runtime since the SDK imports ABIs as JSON, not ethers contract objects.

### Why Hono.js over Express for the API

Hono.js provides Express-equivalent functionality with Web Standards APIs (Request/Response), built-in TypeScript support, and significantly better performance. It runs on Node.js, Bun, Deno, and edge runtimes without modification — giving us deployment flexibility without framework lock-in.

Express is stable but shows its age: no native TypeScript support, callback-based middleware patterns, no built-in validation, and a middleware ecosystem that has not evolved meaningfully. Hono's middleware pattern is simpler and its request/response typing is stronger, which matters in an API that handles financial data.

### Why Drizzle ORM over Prisma

Drizzle ORM generates SQL that reads like SQL. Queries are expressed as typed function calls that map directly to postgres operations — no query engine abstraction layer sitting between your code and the database. This matters for a payment system where we need precise control over transaction isolation, locking behavior, and query performance.

Prisma's schema-first approach and auto-generated client are productive for CRUD applications, but the generated query engine adds a binary dependency, increases cold start times (relevant for serverless deployments), and abstracts away SQL in ways that make database performance harder to reason about. Drizzle gives us type safety without sacrificing control.

### Why Biome over ESLint + Prettier

Biome is a single binary that handles both linting and formatting. It replaces two tools (ESLint + Prettier), multiple plugins (eslint-plugin-import, eslint-config-prettier, @typescript-eslint), and the configuration complexity of making them work together without conflicts.

In a monorepo with four packages, managing ESLint configs across packages (with overrides for different environments — Node, browser, Solidity) becomes a maintenance burden. Biome's single config file applies workspace-wide. It is also significantly faster — linting the entire monorepo takes milliseconds instead of seconds, which improves CI times and developer experience with format-on-save.

### Why Hardhat Ignition over raw deploy scripts

Hardhat Ignition provides declarative, reproducible deployments with built-in dependency resolution. When deploying AgentPay's three contracts — where PaymentRouter depends on AgentRegistry's address, and SplitVault depends on PaymentRouter's address — Ignition resolves the dependency graph automatically and deploys in the correct order.

Raw deploy scripts with `ethers.getContractFactory().deploy()` work for simple cases, but they require manually managing deployment ordering, storing addresses between steps, handling redeployments of individual contracts, and tracking which contracts are already deployed on which networks. Ignition handles all of this with a persistent deployment journal that tracks state across runs, making partial redeployments and multi-network management reliable.

---

## 0G Component Integration Map

This section maps every file in the project that directly interacts with a 0G component, along with what it does.

### 0G Chain

| File | Interaction |
|---|---|
| `packages/contracts/contracts/core/*.sol` | All three core contracts deployed to and executed on 0G Chain |
| `packages/contracts/hardhat.config.ts` | 0G Chain network configuration (RPC URL, chain ID, gas settings) |
| `packages/contracts/ignition/modules/*.ts` | Deployment modules target 0G Chain |
| `packages/sdk/src/client.ts` | Initializes viem clients connected to 0G Chain RPC |
| `packages/sdk/src/modules/registry.ts` | Reads/writes to AgentRegistry contract on 0G Chain |
| `packages/sdk/src/modules/payments.ts` | Submits payment and escrow transactions to PaymentRouter on 0G Chain |
| `packages/sdk/src/modules/splits.ts` | Configures and triggers SplitVault operations on 0G Chain |
| `apps/api/src/lib/agentpay.ts` | Backend SDK client connected to 0G Chain for server-side operations |
| `apps/web/lib/viem.ts` | Browser-side viem client configured for 0G Chain |
| `apps/web/lib/wagmi.ts` | wagmi config with 0G Chain definition for wallet connections |

### 0G Storage

| File | Interaction |
|---|---|
| `packages/sdk/src/modules/storage.ts` | Core 0G Storage integration — writes invoice JSON, reads payment history, queries audit logs |
| `apps/api/src/lib/zgStorage.ts` | Server-side 0G Storage client initialization |
| `apps/api/src/services/StorageService.ts` | Business logic for syncing on-chain events to 0G Storage, querying stored invoices |
| `apps/api/src/routes/invoices.ts` | API endpoints that trigger 0G Storage reads (invoice list) and writes (sync) |

**Data stored:** Invoice records (JSON), agent payment history (append-only logs), protocol audit events.

### 0G Compute

| File | Interaction |
|---|---|
| `packages/sdk/src/modules/oracle.ts` | Submits pricing inference requests to 0G Compute, parses model response into PriceRange |
| `apps/api/src/lib/zgCompute.ts` | Server-side 0G Compute client initialization |
| `apps/api/src/services/OracleService.ts` | Wraps oracle calls with Redis caching, request formatting, error handling |
| `apps/api/src/routes/oracle.ts` | REST endpoint proxying pricing requests to 0G Compute for agents that use HTTP |
| `apps/demo/src/scenarios/oracle-pricing.ts` | Demo scenario that calls the pricing oracle and displays results |

**Model invoked:** AI pricing model that accepts service type, historical rates, demand signals, and reputation score as inputs. Returns floor, suggested, and ceiling price.

### 0G Agent ID

| File | Interaction |
|---|---|
| `packages/contracts/contracts/core/AgentRegistry.sol` | Verifies 0G Agent ID during agent registration, stores binding between Agent ID and wallet |
| `packages/contracts/contracts/libraries/AgentLib.sol` | Helper functions for 0G Agent ID verification and address resolution |
| `packages/sdk/src/modules/registry.ts` | Passes 0G Agent ID during registration calls, resolves agent addresses from IDs |
| `apps/api/src/services/AgentService.ts` | Validates 0G Agent ID format before submitting registration transactions |
| `apps/demo/src/scenarios/agent-registration.ts` | Demo scenario that registers agents with 0G Agent ID binding |

**Identity flow:** Agent creates 0G Agent ID → binds wallet → registers in AgentRegistry (which cross-references the 0G Agent ID) → all subsequent protocol operations verify identity through this chain.

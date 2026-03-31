# AgentPay — Project Structure

> Micropayment and autonomous billing protocol for AI agents on 0G Chain.

**Last updated:** March 31, 2026
**Monorepo manager:** pnpm workspaces
**Build orchestration:** Turborepo

This is a pnpm monorepo with a flat folder structure. Each concern lives in its own root-level directory. Turborepo handles task orchestration, caching, and dependency-aware builds across the workspace.

---

## Complete Directory Tree

```
AgentPay/
│
├── package.json                        # Root package.json — workspace config, shared scripts, devDependency hoisting
├── pnpm-workspace.yaml                 # Defines workspace packages: contracts, sdk, frontend, backend
├── pnpm-lock.yaml                      # Lockfile — committed to version control
├── turbo.json                          # Turborepo pipeline config — build, test, lint, dev task definitions and caching
├── biome.json                          # Biome config — linting and formatting rules (replaces ESLint + Prettier)
├── .env.example                        # Template for all required environment variables with descriptions
├── docker-compose.yml                  # Local dev services: PostgreSQL 16 + Redis 7
├── README.md                           # Project overview, architecture, usage guide, hackathon submission info
├── PROJECT_STRUCTURE.md                # This file — annotated directory tree and architectural decisions
├── PROMPTS.md                          # Sequential build prompts for the MVP
├── LICENSE                             # MIT License
├── .gitignore                          # Ignores: node_modules, dist, .env, coverage, typechain-types, .turbo
├── .npmrc                              # pnpm config — strict peer dependencies, auto-install peers
│
├── contracts/                          # Solidity smart contracts — Hardhat workspace package
│   ├── package.json                    # Package: @agentpay/contracts — Hardhat, OpenZeppelin v5, ethers.js v6
│   ├── hardhat.config.ts              # Hardhat config — Solidity 0.8.24, 0G Chain network, optimizer, typechain
│   ├── tsconfig.json                  # TypeScript config for Hardhat scripts and tests
│   │
│   ├── contracts/
│   │   ├── core/
│   │   │   ├── AgentRegistry.sol      # Agent registration — 0G Agent ID binding, service catalog, identity verification
│   │   │   ├── PaymentRouter.sol      # Payment engine — direct pay, escrow creation, conditional release, fee deduction
│   │   │   └── SplitVault.sol         # Revenue distribution — multi-party splits with basis-point precision
│   │   │
│   │   ├── interfaces/
│   │   │   ├── IAgentRegistry.sol     # Interface for AgentRegistry — used by PaymentRouter for cross-contract calls
│   │   │   ├── IPaymentRouter.sol     # Interface for PaymentRouter — used by external integrators and the SDK
│   │   │   └── ISplitVault.sol        # Interface for SplitVault
│   │   │
│   │   └── mocks/
│   │       └── MockERC20.sol          # Mock ERC-20 token for payment testing
│   │
│   ├── ignition/
│   │   └── modules/
│   │       ├── AgentRegistry.ts       # Hardhat Ignition module — deploys AgentRegistry
│   │       ├── PaymentRouter.ts       # Hardhat Ignition module — deploys PaymentRouter, links to AgentRegistry
│   │       ├── SplitVault.ts          # Hardhat Ignition module — deploys SplitVault
│   │       └── FullDeploy.ts          # Hardhat Ignition module — orchestrates full protocol deployment
│   │
│   ├── test/
│   │   ├── AgentRegistry.test.ts      # Unit tests — registration, lookup, deactivation, duplicate reverts
│   │   ├── PaymentRouter.test.ts      # Unit tests — direct pay, escrow lifecycle, fee deduction, edge cases
│   │   ├── SplitVault.test.ts         # Unit tests — split config, distribution math, deactivation
│   │   └── integration.test.ts        # Integration tests — full payment flow across all three contracts
│   │
│   └── typechain-types/               # Auto-generated TypeScript types (gitignored, built on compile)
│
├── sdk/                                # TypeScript SDK — @agentpay/sdk npm package
│   ├── package.json                    # Package: @agentpay/sdk — viem v2, zod
│   ├── tsconfig.json                  # TypeScript 5.4+ strict config
│   ├── tsup.config.ts                 # tsup bundler config — outputs CJS + ESM, generates .d.ts
│   ├── vitest.config.ts               # Vitest test config
│   │
│   └── src/
│       ├── index.ts                   # Public API barrel export — AgentPayClient, types, utilities
│       ├── client.ts                  # AgentPayClient class — initialization with RPC, wallet, contract addresses, 0G endpoints
│       │
│       ├── modules/
│       │   ├── registry.ts            # Agent registration, lookup by ID, service catalog queries
│       │   ├── payments.ts            # Direct pay, escrow creation, release, cancel, status queries
│       │   ├── splits.ts             # SplitVault configuration, distribution execution, balance queries
│       │   ├── storage.ts            # 0G Storage integration — write invoices, read payment history
│       │   └── oracle.ts             # 0G Compute integration — submit pricing requests, parse price recommendations
│       │
│       ├── types/
│       │   ├── index.ts              # Barrel export all types
│       │   ├── agent.ts              # Agent types — AgentProfile, RegisterAgentParams, AgentService
│       │   ├── payment.ts            # Payment types — PaymentRequest, EscrowRecord, EscrowStatus
│       │   ├── split.ts              # Split types — SplitConfig, SplitRecipient, DistributionResult
│       │   ├── invoice.ts            # Invoice types — Invoice, InvoiceLineItem, InvoiceFilter, PaginatedInvoices
│       │   ├── oracle.ts             # Oracle types — PricingRequest, PricingResponse, PriceRange
│       │   └── schemas.ts            # Zod schemas for runtime validation of all input types
│       │
│       ├── utils/
│       │   ├── addresses.ts          # Address helpers — isNativeToken, shortenAddress
│       │   ├── amounts.ts            # Token amount formatting, wei conversion, basis-point math
│       │   ├── errors.ts             # Custom error classes — AgentPayError, AgentNotFoundError, etc.
│       │   └── constants.ts          # Protocol constants — NATIVE_TOKEN, MAX_SPLIT_RECIPIENTS, BPS_DENOMINATOR
│       │
│       └── abis/
│           ├── AgentRegistry.json     # ABI for AgentRegistry contract
│           ├── PaymentRouter.json     # ABI for PaymentRouter contract
│           └── SplitVault.json        # ABI for SplitVault contract
│
├── frontend/                           # Next.js 14 App Router — web application
│   ├── package.json                    # Package: @agentpay/frontend — next 14, tailwindcss, wagmi v2, viem v2, @tanstack/react-query v5
│   ├── next.config.ts                 # Next.js config — env vars, image domains
│   ├── tailwind.config.ts             # Tailwind CSS config — 0G Foundation color palette, dark mode
│   ├── tsconfig.json                  # TypeScript config — strict, JSX preserve, path aliases (@/)
│   ├── postcss.config.js             # PostCSS config — Tailwind CSS plugin
│   │
│   ├── app/
│   │   ├── layout.tsx                 # Root layout — providers (wagmi, query client), global styles, font loading
│   │   ├── globals.css                # Tailwind directives, body styles, utility classes
│   │   ├── page.tsx                   # Landing page — hero, features, how it works, CTA
│   │   └── dashboard/
│   │       ├── layout.tsx             # Dashboard layout — sidebar navigation, header with wallet connection
│   │       ├── page.tsx               # Dashboard home — payment volume summary, recent transactions
│   │       ├── agents/page.tsx        # Agent directory — browse registered agents
│   │       ├── payments/page.tsx      # Payment list — filterable table of all payments
│   │       ├── escrows/page.tsx       # Escrow management — active escrows, release/cancel actions
│   │       ├── invoices/page.tsx      # Invoice list — all invoices with status filters
│   │       ├── splits/page.tsx        # Revenue splits — configure and view split distributions
│   │       └── oracle/page.tsx        # Oracle pricing — query and view price history
│   │
│   ├── components/
│   │   ├── ui/                        # Base UI components — Button, Card, Badge, Input, Table, Dialog, etc.
│   │   ├── landing/                   # Landing page sections — Hero, Features, HowItWorks, UseCases, Footer
│   │   ├── features/                  # Feature components — PaymentCard, EscrowTimeline, SplitBreakdown, etc.
│   │   ├── layouts/
│   │   │   ├── Sidebar.tsx            # Dashboard sidebar — navigation links, wallet status
│   │   │   └── Header.tsx             # Dashboard header — breadcrumb, wallet connect button
│   │   └── providers.tsx              # Client providers — WagmiProvider, QueryClientProvider
│   │
│   ├── lib/
│   │   ├── wagmi.ts                   # wagmi v2 config — 0G Chain definition, connectors
│   │   ├── query.ts                   # TanStack Query client — default options
│   │   └── api.ts                     # Typed API client — methods for all backend endpoints
│   │
│   ├── hooks/                         # React hooks — useAgentPay, usePaymentHistory, useOraclePrice, etc.
│   │
│   └── public/
│       └── logo.svg                   # AgentPay logo
│
├── backend/                            # Hono.js REST API backend
│   ├── package.json                    # Package: @agentpay/backend — hono, drizzle-orm, pg, redis, @agentpay/sdk
│   ├── tsconfig.json                  # TypeScript config — strict, ESNext
│   ├── drizzle.config.ts             # Drizzle Kit config — schema path, migration output
│   │
│   └── src/
│       ├── index.ts                   # App entry point — Hono app creation, middleware, route mounting, server start
│       │
│       ├── routes/
│       │   ├── agents.ts              # POST / (register), GET / (list), GET /:agentId, PATCH /:agentId/services
│       │   ├── payments.ts            # POST /direct, POST /escrow, POST /escrow/:id/release, POST /escrow/:id/cancel, GET /
│       │   ├── invoices.ts            # POST / (create), GET / (list), GET /:invoiceId, POST /sync
│       │   └── oracle.ts             # POST /price, GET /history
│       │
│       ├── services/
│       │   ├── AgentService.ts        # Agent registration logic — validates input, calls SDK, persists to DB
│       │   ├── PaymentService.ts      # Payment orchestration — escrow creation, release, status tracking
│       │   ├── StorageService.ts      # 0G Storage operations — write invoices, read history, sync events
│       │   └── OracleService.ts       # Oracle proxy — formats pricing requests, caches in Redis
│       │
│       ├── db/
│       │   ├── index.ts               # Drizzle ORM client initialization — PostgreSQL connection
│       │   ├── schema.ts             # Drizzle schema — agents, payments, escrows, invoices, oracle_prices tables
│       │   ├── migrate.ts            # Migration runner script
│       │   └── migrations/            # SQL migration files generated by drizzle-kit
│       │
│       ├── middleware/
│       │   ├── errorHandler.ts        # Global error handler — structured JSON error responses
│       │   └── rateLimit.ts           # Rate limiting middleware — Redis-backed, per-IP limits
│       │
│       └── lib/
│           ├── agentpay.ts            # Singleton AgentPay SDK client instance
│           ├── redis.ts               # Redis client initialization — getCache, setCache helpers
│           ├── config.ts              # Environment variable parsing and validation via Zod
│           ├── zgStorage.ts           # 0G Storage wrapper — storeInvoice, fetchInvoice, fetchAgentHistory
│           └── zgCompute.ts           # 0G Compute wrapper — fetchOraclePrice with Redis caching
│
├── docs/                               # Project documentation
│   ├── README.md                      # Documentation index
│   ├── architecture.md               # System design — three-layer architecture, data flow diagrams
│   ├── contracts.md                   # Contract reference — every function, parameter, event
│   ├── sdk-reference.md              # SDK method reference — public methods, params, return types
│   ├── 0g-integration.md             # Guide for each 0G component integration
│   └── deployment.md                 # Step-by-step deployment guide
│
├── scripts/                            # Utility and operational scripts
│   ├── seed-agents.ts                 # Seeds test agents into the registry
│   ├── verify-contracts.ts            # Contract verification on 0G block explorer
│   └── sync-abis.ts                   # Copies compiled ABIs from contracts to sdk/src/abis
│
└── .github/
    └── workflows/
        ├── ci.yml                     # PR pipeline — install, lint, test, build, typecheck
        ├── deploy-contracts.yml       # Manual trigger — deploys contracts to 0G Chain
        └── publish-sdk.yml            # Triggered on release tag — publishes @agentpay/sdk to npm
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
| `pnpm sdk:build` | sdk | Build SDK — outputs CJS + ESM to `dist/` |
| `pnpm sdk:test` | sdk | Run SDK unit tests with Vitest |
| `pnpm frontend:dev` | frontend | Start Next.js dev server on port 3000 |
| `pnpm backend:dev` | backend | Start API server in development mode with hot reload |
| `pnpm db:migrate` | api | Run Drizzle ORM database migrations |
| `pnpm db:generate` | api | Generate migration files from schema changes |
| `pnpm sync:abis` | scripts | Copy compiled ABIs from contracts to SDK package |
| `pnpm changeset` | Root | Create a new changeset for versioning |
| `pnpm changeset:version` | Root | Apply changesets and bump package versions |

---

## Inter-Package Dependency Map

```
┌──────────────────────────────────────────────────────┐
│                    frontend                           │
│                  (Next.js 14)                         │
│                       │                              │
│                       │ imports                      │
│                       ▼                              │
│  backend ─────────► sdk ◄─────────────────────────  │
│  (Hono.js)    imports  (TypeScript)                  │
│                       │                              │
│                       │ imports ABIs                 │
│                       ▼                              │
│                   contracts                          │
│                 (Hardhat / Solidity)                  │
└──────────────────────────────────────────────────────┘
```

**Dependency details:**

| Consumer | Depends On | What It Uses |
|---|---|---|
| `frontend` | `sdk` | SDK client, types, hooks wrap SDK methods |
| `backend` | `sdk` | SDK client for on-chain operations inside API services |
| `sdk` | `contracts` | Compiled ABI JSON files (copied via `sync:abis` script) |
| `frontend` | `backend` | Runtime HTTP dependency (not a package dependency) — frontend calls API endpoints |

The `contracts` package has no internal dependencies — it is the leaf node. Changes to contracts trigger a rebuild chain: contracts → sdk → backend + frontend.

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
| `contracts/contracts/core/*.sol` | All three core contracts deployed to and executed on 0G Chain |
| `contracts/hardhat.config.ts` | 0G Chain network configuration (RPC URL, chain ID, gas settings) |
| `contracts/ignition/modules/*.ts` | Deployment modules target 0G Chain |
| `sdk/src/client.ts` | Initializes viem clients connected to 0G Chain RPC |
| `sdk/src/modules/registry.ts` | Reads/writes to AgentRegistry contract on 0G Chain |
| `sdk/src/modules/payments.ts` | Submits payment and escrow transactions to PaymentRouter on 0G Chain |
| `sdk/src/modules/splits.ts` | Configures and triggers SplitVault operations on 0G Chain |
| `backend/src/lib/agentpay.ts` | Backend SDK client connected to 0G Chain for server-side operations |
| `frontend/lib/wagmi.ts` | wagmi config with 0G Chain definition for wallet connections |

### 0G Storage

| File | Interaction |
|---|---|
| `sdk/src/modules/storage.ts` | Core 0G Storage integration — writes invoice JSON, reads payment history, queries audit logs |
| `backend/src/lib/zgStorage.ts` | Server-side 0G Storage client initialization |
| `backend/src/services/StorageService.ts` | Business logic for syncing on-chain events to 0G Storage, querying stored invoices |
| `backend/src/routes/invoices.ts` | API endpoints that trigger 0G Storage reads (invoice list) and writes (sync) |

**Data stored:** Invoice records (JSON), agent payment history (append-only logs), protocol audit events.

### 0G Compute

| File | Interaction |
|---|---|
| `sdk/src/modules/oracle.ts` | Submits pricing inference requests to 0G Compute, parses model response into PriceRange |
| `backend/src/lib/zgCompute.ts` | Server-side 0G Compute client initialization |
| `backend/src/services/OracleService.ts` | Wraps oracle calls with Redis caching, request formatting, error handling |
| `backend/src/routes/oracle.ts` | REST endpoint proxying pricing requests to 0G Compute for agents that use HTTP |

**Model invoked:** AI pricing model that accepts service type, historical rates, demand signals, and reputation score as inputs. Returns floor, suggested, and ceiling price.

### 0G Agent ID

| File | Interaction |
|---|---|
| `contracts/contracts/core/AgentRegistry.sol` | Verifies 0G Agent ID during agent registration, stores binding between Agent ID and wallet |
| `contracts/contracts/libraries/AgentLib.sol` | Helper functions for 0G Agent ID verification and address resolution |
| `sdk/src/modules/registry.ts` | Passes 0G Agent ID during registration calls, resolves agent addresses from IDs |
| `backend/src/services/AgentService.ts` | Validates 0G Agent ID format before submitting registration transactions |

**Identity flow:** Agent creates 0G Agent ID → binds wallet → registers in AgentRegistry (which cross-references the 0G Agent ID) → all subsequent protocol operations verify identity through this chain.

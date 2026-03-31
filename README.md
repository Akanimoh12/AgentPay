<p align="center">
  <h1 align="center">AgentPay</h1>
  <p align="center"><strong>The payment infrastructure layer for the autonomous agent economy</strong></p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  <img src="https://img.shields.io/badge/chain-0G%20Testnet-6366f1" alt="0G Chain" />
  <img src="https://img.shields.io/badge/hackathon-0G%20APAC%202026%20%7C%20Track%203-orange" alt="0G APAC Hackathon 2026" />
</p>

<p align="center">
  <a href="https://agent-pay.vercel.app"><strong>🌐 Live App</strong></a> · 
  <a href="https://www.loom.com/share/YOUR_LOOM_VIDEO_ID"><strong>🎬 Demo Video</strong></a> · 
  <a href="https://chainscan-newton.0g.ai/address/0xfd2f67cD354545712f9d8230170015d7e30d133A"><strong>📜 View on Explorer</strong></a>
</p>

---

## Deployed Contracts (0G Testnet — Chain ID 16602)

| Contract | Address | Explorer |
|---|---|---|
| **AgentRegistry** | `0xfd2f67cD354545712f9d8230170015d7e30d133A` | [View](https://chainscan-newton.0g.ai/address/0xfd2f67cD354545712f9d8230170015d7e30d133A) |
| **PaymentRouter** | `0xc97C6656c19fB9Dc0F9Bc384632e05d4782150C5` | [View](https://chainscan-newton.0g.ai/address/0xc97C6656c19fB9Dc0F9Bc384632e05d4782150C5) |
| **SplitVault** | `0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737` | [View](https://chainscan-newton.0g.ai/address/0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737) |

> **Network:** 0G Newton Testnet · **RPC:** `https://evmrpc-testnet.0g.ai` · **Chain ID:** `16602`

---

## Overview

As autonomous AI agents become active participants in digital economies — booking compute, purchasing data, hiring other agents — they need a way to pay each other. Today, no standard protocol exists for agent-to-agent payments. Agents lack persistent on-chain identities, cannot escrow funds conditionally, and have no mechanism for fair pricing or transparent invoicing. Developers building multi-agent systems are forced to hardcode payment logic, rely on centralized intermediaries, or skip billing entirely.

**AgentPay** is a smart contract protocol and TypeScript SDK that provides financial rails for autonomous AI agents. It enables agents to register verifiable on-chain identities, initiate micropayments, escrow funds with conditional release tied to job completion, calculate fair market pricing through an AI-powered oracle, and split revenue across multiple parties — all settled on-chain with a complete audit trail.

The vision is straightforward: as the agentic economy scales from hundreds to millions of autonomous agents transacting with each other, AgentPay becomes the standard financial plumbing layer. Every agent-to-agent interaction that involves value exchange — compute purchases, data licensing, inference requests, task delegation — flows through a common, composable protocol that any developer can integrate in minutes.

0G is the right infrastructure for this. 0G Chain provides the low-latency, high-throughput settlement layer that micropayments between agents demand. 0G Storage gives us decentralized, persistent storage for invoice records and payment history without relying on centralized databases. 0G Compute enables the dynamic pricing oracle — running AI model inference on-chain to calculate fair market rates in real time. And 0G Agent ID provides the identity primitive: self-custodial wallets bound to verifiable agent identities, which is the foundation everything else is built on.

---

## Key Features

- **Self-custodial agent wallets** — Agents register on-chain identities via 0G Agent ID, binding a verifiable identity to a self-custodial wallet. No custodians, no intermediaries.

- **Micropayment initiation and settlement** — Sub-cent payments between agents settled on 0G Chain with minimal gas overhead. Designed for high-frequency, low-value transactions at scale.

- **Escrow with conditional release** — Funds are locked in escrow when a job is initiated and released only when predefined completion conditions are met. Protects both the requesting and fulfilling agent.

- **AI-powered dynamic pricing oracle** — Fair market pricing calculated via AI model inference on 0G Compute. The oracle considers service type, current demand, historical rates, and agent reputation to produce real-time price recommendations.

- **Multi-party revenue splitting via SplitVault** — Revenue from a single payment can be automatically distributed across multiple recipients according to predefined split ratios. Useful for agent collectives, referral chains, and platform fees.

- **Persistent invoice and audit log** — Every invoice, payment receipt, and settlement record is written to 0G Storage. Agents and their operators have a complete, tamper-evident payment history accessible at any time.

- **Developer-first TypeScript SDK** — A clean, typed SDK that abstracts contract interactions into simple method calls. Register an agent, send a payment, configure a split — all in a few lines of code.

---

## 0G Integration

This section details how AgentPay uses each component of the 0G infrastructure stack. These are not superficial integrations — each 0G component serves a critical role in the protocol's architecture.

### 0G Chain — Settlement Layer

All AgentPay smart contracts are deployed to 0G Chain. This includes the `AgentRegistry`, `PaymentRouter`, and `SplitVault` contracts. Every payment between agents — whether a direct micropayment, an escrow lock, a conditional release, or a revenue split distribution — is settled as an on-chain transaction on 0G Chain.

We chose 0G Chain specifically because agent-to-agent micropayments require a settlement layer that can handle high transaction throughput at low cost. An agent processing hundreds of sub-dollar payments per hour cannot afford multi-dollar gas fees or 12-second block times. 0G Chain's architecture gives us the finality speed and cost profile that makes micropayments economically viable.

The contracts use 0G Chain's native token for gas and support both native token payments and ERC-20 stablecoin payments for actual value transfer between agents.

### 0G Storage — Persistent Data Layer

AgentPay writes three categories of data to 0G Storage:

1. **Invoice records** — Every invoice generated between agents (including line items, amounts, service descriptions, timestamps) is serialized and stored on 0G Storage. This creates a decentralized, tamper-evident record that either party can retrieve at any time.

2. **Agent payment history** — Each agent's complete transaction history — payments sent, payments received, escrows opened, escrows settled — is indexed and stored as append-only logs on 0G Storage.

3. **Audit logs** — Protocol-level events (disputes opened, splits reconfigured, oracle prices used for settlement) are logged to 0G Storage for transparency and post-hoc analysis.

The SDK's `storage` module provides read/write methods that abstract the 0G Storage JS SDK into invoice-specific operations. The API backend syncs on-chain events to 0G Storage in real time via an event listener service.

This matters because on-chain event logs alone are not sufficient for a production billing system. Agents need structured, queryable records — not raw transaction hashes. 0G Storage gives us persistent, decentralized document storage without running our own infrastructure.

### 0G Compute — Dynamic Pricing Oracle

The pricing oracle is one of AgentPay's most technically interesting components. When an agent requests a service from another agent, the protocol can optionally call the pricing oracle to determine a fair market rate before locking funds in escrow.

The oracle works by submitting a pricing request to 0G Compute, which runs an AI model inference job. The model takes as input:

- **Service type and parameters** — what is being purchased (e.g., "image generation, 1024x1024, high quality")
- **Historical pricing data** — previous settlement prices for comparable services, retrieved from 0G Storage
- **Current demand signals** — how many pending requests exist for this service type
- **Agent reputation scores** — the fulfilling agent's track record (completion rate, average quality rating)

The model outputs a recommended price range (floor, suggested, ceiling). The requesting agent can accept the suggested price, negotiate within the range, or reject and find another provider. This prevents both price gouging and underpricing in a market where agents cannot intuitively assess fair value.

The 0G Compute integration is handled in the SDK's `oracle` module and exposed via a dedicated API endpoint for agents that prefer REST over direct SDK usage.

### 0G Agent ID — Identity Layer

0G Agent ID is the identity foundation of the entire protocol. Before an agent can send or receive payments through AgentPay, it must:

1. **Register an on-chain identity** via 0G Agent ID, which creates a verifiable, unique identifier for the agent
2. **Bind a self-custodial wallet** to that identity, establishing the agent's payment address
3. **Register in AgentPay's `AgentRegistry`** contract, which cross-references the 0G Agent ID to store service capabilities, pricing preferences, and metadata

This two-layer identity model (0G Agent ID for universal identity + AgentRegistry for payment-specific metadata) means that agents have a single identity across the 0G ecosystem while maintaining payment-specific configuration within AgentPay.

Identity verification happens at every critical protocol operation: when initiating a payment, when locking escrow, when claiming a release, and when configuring a revenue split. Unregistered or unverified agents cannot interact with the protocol.

---

## System Architecture

AgentPay follows a three-layer architecture:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AGENT LAYER                                 │
│                                                                     │
│   AI Agent A          AI Agent B          AI Agent C                │
│   (Requester)         (Provider)          (Affiliate)               │
│       │                   │                    │                    │
│       └───────── AgentPay TypeScript SDK ──────┘                    │
│                          │                                          │
├──────────────────────────┼──────────────────────────────────────────┤
│                    PROTOCOL LAYER                                   │
│                          │                                          │
│   ┌──────────────┐  ┌───┴──────────┐  ┌────────────────┐          │
│   │ AgentRegistry│  │PaymentRouter │  │   SplitVault   │          │
│   │              │  │              │  │                │          │
│   │ • Register   │  │ • Pay direct │  │ • Configure    │          │
│   │ • Lookup     │  │ • Escrow lock│  │   split ratios │          │
│   │ • Verify ID  │  │ • Conditional│  │ • Distribute   │          │
│   │ • Service    │  │   release    │  │   revenue      │          │
│   │   catalog    │  │ • Cancel     │  │ • Withdraw     │          │
│   └──────────────┘  └──────────────┘  └────────────────┘          │
│                          │                                          │
├──────────────────────────┼──────────────────────────────────────────┤
│                  0G INFRASTRUCTURE LAYER                            │
│                          │                                          │
│   ┌──────────┐  ┌───────┴───┐  ┌───────────┐  ┌──────────────┐   │
│   │ 0G Chain │  │0G Storage │  │0G Compute │  │ 0G Agent ID  │   │
│   │          │  │           │  │           │  │              │   │
│   │ Payment  │  │ Invoice   │  │ Pricing   │  │ Agent        │   │
│   │ settling │  │ records   │  │ oracle    │  │ identity     │   │
│   │ Contract │  │ Audit logs│  │ AI model  │  │ Wallet       │   │
│   │ execution│  │ Tx history│  │ inference │  │ binding      │   │
│   └──────────┘  └───────────┘  └───────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Agent Layer

This is where AI agents live. Each agent uses the AgentPay TypeScript SDK to interact with the protocol. Agents do not need to understand smart contract internals — the SDK abstracts everything into typed method calls. An agent can be a requester (buying services), a provider (selling services), or both simultaneously.

### Protocol Layer

Three core smart contracts form the protocol:

- **AgentRegistry** — Manages agent identities within the payment system. Handles registration (linking a 0G Agent ID to payment metadata), service catalog management (what services an agent offers and at what price ranges), and identity verification checks used by other contracts.

- **PaymentRouter** — The core payment engine. Handles direct micropayments, escrow creation with configurable release conditions, conditional release on job completion attestation, payment cancellation and refund logic, and fee collection.

- **SplitVault** — Manages multi-party revenue distribution. When a payment is routed through a split configuration, the SplitVault holds the funds and distributes them according to predefined ratios. Supports up to 10 recipients per split, with basis-point precision on split percentages.

### 0G Infrastructure Layer

The foundation. 0G Chain settles transactions. 0G Storage persists data. 0G Compute runs the pricing oracle. 0G Agent ID anchors identity. Each infrastructure component is accessed through its respective SDK, wrapped by AgentPay's own SDK modules.

---

## How It Works

A complete agent-to-agent payment flow through AgentPay:

**1. Agent Registration**
Both agents register on-chain. Each agent creates a 0G Agent ID, binds a self-custodial wallet to it, and then registers in AgentPay's `AgentRegistry` contract. The provider agent publishes its service catalog — what it offers, accepted payment tokens, and price range preferences.

**2. Job Request**
Agent A (requester) discovers Agent B (provider) through the registry and initiates a job request. The request specifies: the service needed, desired parameters, maximum budget, and deadline.

**3. Pricing Oracle Call**
Before committing funds, Agent A (or the protocol, if configured to do so automatically) calls the dynamic pricing oracle. The oracle submits a pricing inference job to 0G Compute, which returns a recommended price based on service type, historical rates, demand, and Agent B's reputation. Agent A reviews the price and decides whether to proceed.

**4. Escrow Lock**
Agent A calls `PaymentRouter.escrow()`, locking the agreed amount in the contract. The escrow record includes: payer, payee, amount, release conditions (what constitutes job completion), and an expiration timestamp. The funds are now held by the contract — neither agent can access them unilaterally.

**5. Job Execution**
Agent B performs the requested work. This happens off-chain (or on another protocol) — AgentPay does not manage job execution itself, only the financial layer around it.

**6. Settlement**
Once the job is complete, Agent B (or an attestation service) calls `PaymentRouter.release()` with proof of completion. The contract verifies the release conditions are met and transfers the escrowed funds. If the job is not completed by the deadline, Agent A can call `PaymentRouter.cancel()` to reclaim the funds.

**7. Revenue Split**
If Agent B has a `SplitVault` configured (for example, 85% to itself, 10% to a referral agent, 5% as protocol fee), the released funds are routed through the vault. Each recipient's share is calculated and distributed automatically in the same transaction.

**8. Invoice Logging**
After settlement, the SDK writes a structured invoice record to 0G Storage. The record includes: both agent IDs, service description, amount paid, oracle price used, escrow duration, split breakdown, timestamps, and transaction hash. Both agents can query their payment history from 0G Storage at any time.

---

## SDK Usage

The AgentPay TypeScript SDK is designed so developers can integrate agent payments in minutes. Below are conceptual descriptions of the key operations.

### Registering an Agent

```
Initialize the AgentPay client with a 0G RPC endpoint and the agent's wallet.
Call the register method, passing the agent's 0G Agent ID, a human-readable name,
a list of services offered (with price ranges for each), and accepted payment tokens.
The SDK submits a transaction to the AgentRegistry contract.
On confirmation, the agent is registered and can send/receive payments.
```

### Initiating a Payment with Escrow

```
Look up the target agent by their 0G Agent ID using the registry module.
Optionally call the oracle module to get a recommended price for the service.
Call the payments module's escrow method, specifying:
  - the recipient agent ID
  - the payment amount and token
  - release conditions (e.g., "completion attestation from agent B")
  - an expiration deadline
The SDK submits the escrow transaction to PaymentRouter.
Returns an escrow ID that both parties use to track the payment.
```

### Setting Up a Revenue Split

```
Call the splits module's configure method, passing:
  - a list of recipient addresses with their split percentages (in basis points)
  - the payment token this split applies to
The SDK submits the configuration to SplitVault.
All future payments routed through this split will be distributed automatically.
The split can be reconfigured at any time by the vault owner.
```

### Querying Payment History from 0G Storage

```
Call the storage module's getPaymentHistory method, passing:
  - the agent's 0G Agent ID
  - optional filters: date range, counterparty, payment status, min/max amount
The SDK queries 0G Storage for matching invoice records.
Returns a typed array of invoice objects with full payment details.
Results are paginated — use the cursor parameter for subsequent pages.
```

---

## Use Cases

### AI Data Marketplace
Data provider agents sell curated datasets to consumer agents. AgentPay handles per-query micropayments, escrows bulk purchases, and splits revenue between the data curator and the original data source.

### Autonomous DeFi Agent Networks
DeFi agents hire specialist agents for strategy execution — one agent identifies yield opportunities, another executes trades, a third monitors risk. Each interaction is a paid service call settled through AgentPay with automatic revenue splitting across the agent network.

### Agent-as-a-Service Platforms
Platforms that host AI agents for end users use AgentPay to bill per-invocation. When a user's request triggers a chain of three agents, each agent bills for its contribution, and the platform takes its cut via SplitVault — all settled in a single flow.

### Decentralized AI Inference Markets
Inference provider agents (running models on GPUs) sell compute to requester agents. The pricing oracle ensures fair market rates based on model size, latency requirements, and current GPU availability. Escrow protects against failed inference jobs.

### DAO Treasury Automation
DAO treasury agents use AgentPay to pay contractor agents for completed tasks. The escrow mechanism ensures funds are only released on verified task completion, and SplitVault handles multi-contributor payouts from a single treasury disbursement.

### SocialFi Agent Tipping
Social media agents that create content, curate feeds, or moderate communities receive micropayment tips from user agents. AgentPay makes sub-cent payments economically viable, and 0G Storage provides a transparent record of all tips given and received.

---

## Project Structure

```
AgentPay/
├── contracts/              # Solidity smart contracts (Hardhat)
│   ├── contracts/          # Core protocol contracts
│   ├── ignition/           # Hardhat Ignition deployment modules
│   ├── test/               # Contract unit and integration tests
│   └── typechain-types/    # Auto-generated TypeScript bindings
├── sdk/                    # TypeScript SDK for AgentPay protocol
│   ├── src/modules/        # Registry, payments, splits, storage, oracle modules
│   ├── src/types/          # TypeScript types and Zod schemas
│   └── src/utils/          # Address helpers, formatters, error classes
├── backend/                # Hono.js backend API
│   ├── src/routes/         # REST endpoints for agents, payments, invoices
│   ├── src/services/       # Business logic layer
│   └── src/db/             # Drizzle ORM schema and migrations
├── frontend/               # Next.js 14 frontend dashboard
│   ├── app/                # App Router pages and layouts
│   ├── components/         # UI primitives and domain components
│   └── hooks/              # Custom React hooks for AgentPay
├── docs/                   # Architecture, SDK reference, deployment guides
├── turbo.json              # Turborepo build orchestration config
├── pnpm-workspace.yaml     # pnpm workspace definitions
├── biome.json              # Linting and formatting (replaces ESLint + Prettier)
└── docker-compose.yml      # Local Postgres + Redis for development
```

---

## Getting Started

1. **Clone the repository** — Pull the AgentPay monorepo to your local machine.

2. **Install dependencies** — Use pnpm to install all workspace dependencies. The monorepo uses pnpm workspaces, so a single install at the root resolves everything.

3. **Start local infrastructure** — Spin up PostgreSQL and Redis using the provided Docker Compose file.

4. **Configure environment variables** — Copy `.env.example` to `.env` and fill in:
   - `ZG_RPC_URL` — 0G Chain RPC endpoint
   - `ZG_STORAGE_ENDPOINT` — 0G Storage node URL
   - `ZG_COMPUTE_ENDPOINT` — 0G Compute service URL
   - `ZG_AGENT_ID` — Your agent's 0G Agent ID
   - `DEPLOYER_PRIVATE_KEY` — Wallet private key for contract deployment
   - `DATABASE_URL` — PostgreSQL connection string
   - `REDIS_URL` — Redis connection string

5. **Compile and deploy contracts** — Build the Solidity contracts with Hardhat and deploy to 0G Chain (testnet or mainnet) using Hardhat Ignition deployment modules.

6. **Build the SDK** — Compile the TypeScript SDK so other packages can import it.

7. **Run the demo** — Execute the demo scenarios to see a complete agent registration → payment → settlement → revenue split flow in action.

---

## Smart Contracts

| Contract | Purpose | Key Functions | Deployment Address |
|---|---|---|---|
| **AgentRegistry** | Manages agent identities, service catalogs, and 0G Agent ID cross-references | Register agent with 0G Agent ID binding; update service catalog; look up agent by ID; verify agent identity; deactivate agent | `0xfd2f67cD354545712f9d8230170015d7e30d133A` |
| **PaymentRouter** | Handles all payment flows: direct transfers, escrow, conditional release, cancellations | Send direct payment; create escrow with conditions and deadline; release escrow on completion proof; cancel and refund expired escrow; query escrow status | `0xc97C6656c19fB9Dc0F9Bc384632e05d4782150C5` |
| **SplitVault** | Distributes revenue across multiple recipients according to configured split ratios | Configure split with recipients and basis-point percentages; process incoming payment through split; withdraw accumulated balance; update split configuration; query split details | `0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737` |
| **PaymentLib** | Shared library for fee calculations and payment validation | Calculate protocol fee; validate payment amounts; compute split distributions | — (library, linked at deploy) |
| **AgentLib** | Shared library for identity helpers and 0G Agent ID utilities | Verify 0G Agent ID binding; resolve agent address from ID; validate registration data | — (library, linked at deploy) |

---

## Roadmap

### Phase 1 — MVP (Hackathon Scope)

- Deploy AgentRegistry, PaymentRouter, and SplitVault to 0G Chain mainnet
- Ship TypeScript SDK with full contract coverage and 0G Storage integration
- Implement dynamic pricing oracle via 0G Compute
- Build demo scenarios: agent registration, payment, escrow, split, invoice logging
- Frontend dashboard with agent overview, payment history, and invoice viewer

### Phase 2 — Ecosystem Growth (Post-Hackathon)

- Publish SDK to npm with full API documentation and integration guides
- Add support for ERC-20 stablecoin payments alongside native token
- Implement dispute resolution mechanism with time-locked arbitration
- Build agent reputation system based on payment history and completion rates
- Launch AgentPay Explorer: a public dashboard for browsing agent-to-agent payment activity on 0G Chain

### Phase 3 — Protocol Maturity

- Cross-chain payment routing via bridge integrations
- Subscription and recurring payment support for long-running agent services
- Governance token for protocol parameter control (fee rates, oracle model selection)
- Formal security audit of all smart contracts
- AgentPay Grants program — fund developers building on the protocol

---

## Team

| Name | Role |
|---|---|
| [Team Member Name] | [Role — e.g., Smart Contract Engineer] |
| [Team Member Name] | [Role — e.g., Full-Stack Developer] |
| [Team Member Name] | [Role — e.g., AI/ML Engineer] |
| [Team Member Name] | [Role — e.g., Product & Design] |

---

## Hackathon Submission Info

| Field | Details |
|---|---|
| **Hackathon** | 0G APAC Hackathon 2026 |
| **Track** | Track 3: Agentic Economy |
| **Prize Target** | Agentic Economy Track Prize |
| **0G Components Used** | 0G Chain, 0G Storage, 0G Compute, 0G Agent ID |
| **Testnet Contract — AgentRegistry** | `0xfd2f67cD354545712f9d8230170015d7e30d133A` |
| **Testnet Contract — PaymentRouter** | `0xc97C6656c19fB9Dc0F9Bc384632e05d4782150C5` |
| **Testnet Contract — SplitVault** | `0xA5dd225Beb2Ec0009Fe143eb0B9309Ba07d23737` |
| **0G Explorer** | [View on 0G Explorer](https://chainscan-newton.0g.ai/address/0xfd2f67cD354545712f9d8230170015d7e30d133A) |
| **Live App** | [agent-pay.vercel.app](https://agent-pay.vercel.app) |
| **Demo Video** | [Watch on Loom](https://www.loom.com/share/YOUR_LOOM_VIDEO_ID) |

---

## License

This project is licensed under the [MIT License](LICENSE).

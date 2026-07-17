# EscrowX

> A trustless escrow dApp on **Stellar / Soroban**. Lock funds in a smart contract, deliver the work, and release payment only when both sides agree — no middleman holding the money.

## About

EscrowX lets a **buyer** and a **seller** transact safely on the Stellar blockchain.

1. The buyer creates an escrow and locks funds in an on-chain vault.
2. The seller delivers the work and marks it delivered.
3. The buyer releases the payment to the seller — or refunds it back.

Every step is enforced by smart contracts, so funds are never held by a person or a centralized server. The whole lifecycle — `Pending → Funded → Delivered → Completed` (or `Refunded`) — lives on-chain. Two contracts split the work: an **Escrow** contract owns the logic and state, while a separate **PaymentVault** contract custodies the funds and only accepts calls from the Escrow contract.

## Demo Video : [youtube](https://youtu.be/X_TeNDAFMiw)
## live Website Link : [vercel](https://escrow-x-neon.vercel.app/)
## FeedBack Form: [google form](https://docs.google.com/forms/d/1Dwvo4hPEJ4e5Cxy5M8VsC1Re3Cd-bO48PdCCwFL27uk/viewform?edit_requested=true)
## Feedback Sheet: [google sheet](https://docs.google.com/spreadsheets/d/1vilamgP42YUIzEAMScySXr090Vy0apxv9g8k8BCqcV0/edit?usp=sharing)


## Deployed Contracts (Stellar Testnet)

| Contract | Contract ID |
|---|---|
| **Escrow** (the app calls this) | `CCQGEVIMQQR2JO22WRLSBLADPOXGLHGTF5I63WBEP2Q6ZGJED3QXY3R4` |
| **PaymentVault** (custodies funds) | `CCVTGEVTRY4CFIJUIS6YP3OTY5LO5HSQTZCXAW57ZHNKTEZCAQ6QDQRP` |
| **Payment Asset** (native XLM SAC) | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

 Escrow → [Stellar.Expert](https://stellar.expert/explorer/testnet/contract/CCQGEVIMQQR2JO22WRLSBLADPOXGLHGTF5I63WBEP2Q6ZGJED3QXY3R4)
- PaymentVault → [Stellar.Expert](https://stellar.expert/explorer/testnet/contract/CCVTGEVTRY4CFIJUIS6YP3OTY5LO5HSQTZCXAW57ZHNKTEZCAQ6QDQRP)


## Tech Stack

**Smart Contracts**
- Rust + Soroban SDK
- Cargo workspace with two contracts: `escrow` and `payment_vault`

**Frontend**
- React + TypeScript, built with Vite
- Tailwind CSS
- `@stellar/stellar-sdk` for RPC / transactions
- Freighter & Albedo wallet support

**Hosting**
- Vercel (frontend)
---

## 🏛️ Architecture

EscrowX is split into two layers: smart contracts that live **on the Stellar blockchain**, and a web frontend hosted **on Vercel** that talks to them.

```
┌──────────────┐     HTTPS      ┌─────────────────┐    Soroban RPC    ┌──────────────────────────────┐
│   Browser    │ ─────────────► │  Frontend (Vite) │ ────────────────► │   Stellar / Soroban network  │
│ Freighter /  │                │   on Vercel      │                   │                              │
│   Albedo     │ ◄───sign tx────│                  │ ◄────results──────│  ┌────────────────────────┐  │
└──────────────┘                └─────────────────┘                   │  │  Escrow contract       │  │
                                                                      │  │  (lifecycle/state)     │  │
                                                                      │  └───────────┬────────────┘  │
                                                                      │     cross-contract call      │
                                                                      │  ┌───────────▼────────────┐  │
                                                                      │  │  PaymentVault contract │  │
                                                                      │  │  (holds the funds)     │  │
                                                                      │  └────────────────────────┘  │
                                                                      └──────────────────────────────┘
```

**Why two contracts?** The **Escrow** contract owns the *logic and state* (who's the buyer/seller, the status, the amount). The **PaymentVault** contract owns the *money*. The vault only ever accepts calls from the Escrow contract (enforced via `require_auth`), so funds can never be moved except through the agreed escrow rules. The frontend only ever calls the Escrow contract.

### Escrow lifecycle

```
create_escrow ──► Pending ──► deposit_funds ──► Funded ──► mark_delivered ──► Delivered
                                                  │                              │
                                                  └──────────┬───────────────────┘
                                                             ▼
                                          release_payment ──► Completed   (seller paid)
                                          refund_payment  ──► Refunded    (buyer refunded)
```

### Repository layout

```
EscrowX/
├── contracts/                 # Rust / Soroban smart contracts (Cargo workspace)
│   ├── escrow/                # Escrow lifecycle & state
│   └── payment_vault/         # Fund custody
├── frontend/                  # React + Vite web app  (deployed on Vercel)
│   ├── src/
│   │   ├── pages/             # Landing, Dashboard, CreateEscrow, EscrowDetails, History, Settings
│   │   ├── components/        # UI, layout, escrow widgets, wallet modal
│   │   ├── contexts/          # Wallet connection state
│   │   ├── services/wallets/  # Freighter & Albedo adapters
│   │   ├── hooks/             # Data fetching & actions
│   │   └── config/            # Network + contract config (from env vars)
│   └── vercel.json            # Vercel build/rewrite config
├── screenshot/                # App screenshots (below)
├── .github/workflows/         # CI/CD: contract.yml + frontend.yml
├── Cargo.toml                 # Rust workspace manifest
└── rust-toolchain.toml        # Pinned Rust toolchain + wasm target

---
---

## 📸 Screenshots

### Landing page
![Landing page](./screenshot/landing_page.png)

### Dashboard
![Dashboard](screenshot/dashboard.png)

### Approving a connection with Freighter
![Approve with Freighter](screenshot/approve_frieghter.png)

### Paying with Albedo
![Pay with Albedo](screenshot/albedo_pay.png)

### Using different wallets
![Different wallets](screenshot/diff_wallet.png)

### Completed escrow
![Escrow complete](screenshot/escrow_complete.png)


### phone responsive

![phone responsive](screenshot/ph_response.png)

---

## 🔄 CI/CD

Two GitHub Actions workflows run automatically:

- **`contract.yml`** — on contract changes: `cargo fmt` check, `clippy`, `cargo test`, and a wasm release build.
- **`frontend.yml`** — on frontend changes: lint, type-check, test, and build; then deploys to Vercel on pushes to `main`.

The frontend deploy needs three GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

---

## 📄 License

[MIT](LICENSE)

# Confidential Proof of Reserves — Browser DApp (Level 2)

Lace-connected browser frontend that **deploys** the PoR Compact contract on **Midnight Preprod** and calls **`proveSolvency` from the client**. Built for the [Rise In Midnight hackathon](https://www.risein.com/programs/new-moon-to-full-monthly-moonshots-on-midnight) Level 2 track.

| | |
|---|---|
| **Live demo** | https://por-browser.netlify.app |
| **Repository** | https://github.com/Cryptonean/confidential-por-midnight (`browser/`) |
| **Submission guide** | [SUBMISSION.md](./SUBMISSION.md) |
| **Commit plan (≥8)** | [COMMITS.md](./COMMITS.md) |

---

## Privacy claim

The circuit proves **`reserves ≥ Σ customer liabilities`** without publishing individual balances.

**What Midnight publishes (public ledger):**

- `solvent` — boolean verdict after ZK proof
- `reservesSnapshot` and `reservesSlot` — attested reserves and time anchor
- `liabilitiesRoot` — Merkle commitment to the liability tree (not the balances)
- `owner` — custodian public key hash

**What stays private (ZK witness only):**

- Total liabilities value
- Per-customer balances and leaf salts
- Full Merkle tree structure beyond the published root

The **Privacy boundary** panel in the UI contrasts these explicitly. Customer balances are shown in the demo sandbox for illustration — they are **not** written on-chain. After a successful prove, refresh the ledger and confirm only the root + solvent flag appear in contract state.

---

## Level 2 requirements (this package)

| Requirement | Implementation |
|-------------|----------------|
| Lace connect / disconnect | `src/wallet/walletConnector.ts`, `WalletBar.tsx` |
| Circuit from frontend | `PorBrowserClient.ts` → `proveSolvency` via Lace / ProofStation |
| Observable privacy | `PrivacyPanel.tsx` — witness vs on-chain fields |
| Preprod deploy | **Deploy fresh contract** button → real on-chain address |
| Live demo | Netlify — see [DEPLOY.md](./DEPLOY.md) |

---

## Quick start (local)

```bash
# From monorepo root
pnpm install
pnpm --filter @por/por-browser build:zk   # compile N=8 circuit + copy keys
pnpm --filter @por/por-browser dev        # http://localhost:5175
```

Copy `.env.example` → `.env`:

```bash
VITE_NETWORK_ID=preprod
# 1AM / Netlify: leave VITE_PROOF_SERVER_URL unset
# Local Docker proving (faster dev): VITE_PROOF_SERVER_URL=http://localhost:6300
```

See [LOCAL_PROVE.md](./LOCAL_PROVE.md) for Docker proof-server setup.

---

## User flow

1. **Connect** — Lace or 1AM (DApp connector API `4.x`) on Preprod
2. **Deploy fresh contract** — deploys browser N=8 circuit; address stored in localStorage
3. **proveSolvency from browser** — ZK proof via wallet → ProofStation (or local Docker)
4. **Privacy boundary** — compare witness-only liabilities vs on-chain verdict
5. **Disconnect** — clean session teardown

---

## Preprod contract verification

After deploy, copy the contract address from the wallet bar and verify:

```bash
pnpm --filter @por/por-browser verify:preprod -- <CONTRACT_ADDRESS_HEX>
```

Record your address in `submission.preprod.json` (template: `submission.preprod.example.json`).

---

## Build & deploy

```bash
pnpm --filter @por/por-browser build
pnpm --filter @por/por-browser verify:deploy
pnpm --filter @por/por-browser deploy:netlify
```

Full Netlify / 1AM / ZK asset notes: [DEPLOY.md](./DEPLOY.md).

---

## Architecture

```
Browser UI (React)
  ├─ walletConnector     Lace / 1AM connect · disconnect · DUST readiness
  ├─ PorBrowserClient    deployContract · callTx(proveSolvency) · readState
  ├─ browser-circuit/    N=8 Merkle-sum tree + witnesses (demo)
  ├─ compact/por-browser.compact
  └─ public/keys|zkir    ~18 MB prover (N=8) — built by build:zk
```

Production N=64 circuit remains in `@por/contract` / `@por/onchain`; this package uses a **browser-sized N=8** variant for ProofStation and extension limits.

---

## Related packages

| Package | Role |
|---------|------|
| `@por/contract` | Production N=64 Compact `proveSolvency` |
| `@por/core` | Merkle tree + witnesses (server) |
| `@por/onchain` | CLI reference client + full ZK key build |

This package mirrors `packages/onchain/src/solvency-client.ts` but uses `FetchZkConfigProvider` and Lace for wallet / proof / submit.

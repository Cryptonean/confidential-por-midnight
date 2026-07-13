# Confidential Proof of Reserves on Midnight

**Rise In : New Moon to Full** — Level 1 circuit + **Level 2 browser DApp**

Prove `Σ assets ≥ Σ liabilities` in zero-knowledge without revealing any customer balance. Customer liabilities live in a private Merkle-sum tree; the Compact circuit publishes only a salted root, a reserves snapshot, a slot, and a boolean `solvent` verdict via `disclose()`. The total liabilities value never reaches the ledger.

| Track | Location | Live |
|-------|----------|------|
| **Level 1** — Compact circuit + simulator tests | `contract/`, `src/`, `test/` | Preprod contract below |
| **Level 2** — Lace browser DApp (deploy + prove from frontend) | [`browser/`](./browser/) | https://por-browser.netlify.app |

**Level 2 submission checklist:** [`browser/SUBMISSION.md`](./browser/SUBMISSION.md)

---

## Level 2 — Browser DApp (Lace + Preprod)

The **`browser/`** folder is a standalone React + Vite DApp that:

- Connects / disconnects **Lace** or **1AM** on Preprod
- **Deploys** a fresh `proveSolvency` contract from the browser
- Calls **`proveSolvency`** with a ZK proof (ProofStation or local Docker)
- Shows **observable privacy** — liabilities stay in the witness; only root + solvent flag go on-chain

```bash
cd browser
pnpm install
pnpm build:zk          # compile N=8 browser circuit (~18 MB prover)
cp .env.example .env   # VITE_NETWORK_ID=preprod
pnpm dev               # http://localhost:5175
```

| | |
|---|---|
| **Live demo** | https://por-browser.netlify.app |
| **Privacy claim** | [`browser/README.md#privacy-claim`](./browser/README.md#privacy-claim) |
| **Deploy to Netlify** | [`browser/DEPLOY.md`](./browser/DEPLOY.md) |
| **Commit plan (≥8)** | [`browser/COMMITS.md`](./browser/COMMITS.md) |

### Level 2 Preprod deployment

| | |
|---|---|
| **Network** | Midnight Preprod |
| **Contract** | `3a6fde1659e91c4d7fac10b5d79adb04fcd915b46958cc739681e760522b2cab` |
| **Deploy tx** | `92d95e36b827f395ab873d47422b225ae44e3a4d1cb5d38e4bcced9da91d29dd` (block 1,638,861) |
| **proveSolvency tx** | `39e157b87fb9c2485a2ec21bcd5388a2e3b80146909049b6953a915723024826` (block 1,638,877) |

---

## Level 1 — Circuit + simulator

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 22+ |
| pnpm | 10+ |
| Compact CLI | 0.31.x |

### Quickstart

```bash
pnpm install
pnpm build:contract   # compact compile → contract/managed/
pnpm test             # vitest: runs proveSolvency in the simulator
```

`contract/managed/` is gitignored — run `pnpm build:contract` before tests.

### Public state vs private witness

See [`contract/src/por.compact`](contract/src/por.compact).

| Public ledger | Private witness |
|---------------|-----------------|
| `solvent`, `liabilitiesRoot`, `reservesSnapshot`, `reservesSlot`, `owner` | Customer balances, leaf salts, full Merkle tree |

**Never published:** total liabilities value — only `disclose(totalLiabilities <= reserves)` becomes the public boolean.

### Level 1 Preprod deployment

| | |
|---|---|
| **Network** | Midnight Preprod |
| **Contract** | `0518e4dd6290efef2b8bca3edc38092ff3cbaa14d81575c93109bcb88c7f3acf` |
| **Block** | 1,375,054 |
| **Verdict** | `solvent=true`, `reserves=1,875,000,000` |

---

## Project layout

```
browser/                   Level 2 — Lace DApp (React + Vite + Netlify)
  compact/por-browser.compact
  src/wallet/              connect / disconnect
  src/por/                 deploy + proveSolvency
  src/components/          PrivacyPanel
contract/src/por.compact   Level 1 — N=64 production circuit
src/                       Level 1 — witnesses, tree, simulator
test/solvency.test.ts      Level 1 — circuit tests
docs/screenshots/          Submission screenshots
```

---

## License

Apache 2.0

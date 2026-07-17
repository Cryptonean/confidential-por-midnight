# Solvency Eligibility Gate on Midnight

[![CI](https://github.com/cryptonean/confidential-por-midnight/actions/workflows/ci.yml/badge.svg)](https://github.com/cryptonean/confidential-por-midnight/actions/workflows/ci.yml)


**Rise In : New Moon to Full** — Level 3 **Age / Eligibility Gate** (builds on Level 1 circuit + Level 2 browser DApp)

Prove a **private liability total ≤ public reserves** in zero-knowledge without revealing balances. Same selective-disclosure pattern as an age/eligibility gate: observers learn only pass/fail (`solvent`), reserves/slot, and a Merkle commitment root.

| Track | Location | Live |
|-------|----------|------|
| **Level 3** — Eligibility Gate framing, tests, CI | [`browser/`](./browser/) | https://por-browser.netlify.app |
| **Level 1** — Compact circuit + simulator tests | `contract/`, `src/`, `test/` | Preprod contract below |
| **Level 2** — Lace browser DApp (deploy + prove) | [`browser/`](./browser/) | https://por-browser.netlify.app |

**Level 3 proposal:** [`browser/PRODUCT_PROPOSAL.md`](./browser/PRODUCT_PROPOSAL.md)  
**Level 3 checklist:** [`browser/SUBMISSION.md`](./browser/SUBMISSION.md)

#### Level 3 Txhash =  https://explorer.1am.xyz/tx/04328f15a34c9e52fdaa0105095beea5b0e8310a22ae8f3e78eb57e60fa9f445?network=preprod & https://explorer.1am.xyz/tx/30d3ee74a43fcff072d23fbe274ca1b2a4480570db02cc0edeb84fc79c6ed027?network=preprod
```bash
pnpm --dir browser test    # ≥3 Level 3 unit tests
pnpm test                  # Level 1 simulator (needs Compact CLI)
```
### Prior recording (Level 3) = https://drive.google.com/file/d/1fGKxiQmf072aqRLmS1a9AH0qIX2PM_PU/view?usp=sharing

### Prior recording (Level 2) = https://drive.google.com/file/d/12lk6iUl56ojJDjkDTkxuL_Rv7OTcx7sl/view?usp=sharing

---

## Privacy model

**Observer can learn:** `solvent`, `reservesSnapshot`, `reservesSlot`, `liabilitiesRoot`, `owner`  
**Observer cannot learn:** exact liability total, per-customer balances/salts, full Merkle witness, custodian secret key  

Details: [`browser/README.md#privacy-model`](./browser/README.md#privacy-model)

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
| **Privacy claim** | [`browser/README.md#privacy-model`](./browser/README.md#privacy-model) |
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
browser/                   Level 2/3 — Lace DApp (React + Vite + Netlify)
  compact/por-browser.compact
  src/wallet/              connect / disconnect
  src/por/                 deploy + proveSolvency
  src/eligibility/         Level 3 threshold helper + tests
  src/components/          PrivacyPanel
contract/src/por.compact   Level 1 — N=64 production circuit
src/                       Level 1 — witnesses, tree, simulator
test/solvency.test.ts      Level 1 — circuit tests
docs/screenshots/          Submission screenshots
```

---

## License

Apache 2.0

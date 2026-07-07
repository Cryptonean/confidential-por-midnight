# Confidential Proof of Reserves on Midnight

**Rise In : New Moon to Full, Level 1 submission**

Prove `Σ assets ≥ Σ liabilities` in zero-knowledge without revealing any customer balance. Customer liabilities live in a private Merkle-sum tree; the Compact circuit publishes only a salted root, a reserves snapshot, a slot, and a boolean `solvent` verdict via `disclose()`. The total liabilities value never reaches the ledger.

---

## Product idea

Custodians need to prove solvency after FTX, but publishing a full balance sheet leaks every customer's holdings. This project lets an exchange prove **"my reserves cover my liabilities"** while keeping individual balances private. A lying custodian cannot publish `solvent=true` unless the committed liabilities really sum to at most the stated reserves inflate a hidden liability and the proof fails.

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 22+ |
| pnpm | 10+ |
| Compact CLI | 0.31.x |
| Docker | optional (proof server, for full ZK deploy) |

Install Compact from [Midnight docs](https://docs.midnight.network/). Proof server (optional):

```bash
docker run -p 6300:6300 midnightntwrk/proof-server
```

---

## Quickstart

```bash
pnpm install
pnpm build:contract   # compact compile → contract/managed/
pnpm test             # vitest: runs proveSolvency in the simulator
```

`contract/managed/` is gitignored run `pnpm build:contract` before tests. The fast compile uses `--skip-zk`; full PLONK keys are generated when you deploy on-chain.

---

## Public state vs private witness

The `proveSolvency` circuit in [`contract/src/por.compact`](contract/src/por.compact) separates what stays private from what is deliberately published.

### Public ledger (`export ledger`)

These fields are written to the on-chain ledger after a successful proof:

| Field | Meaning |
|---|---|
| `owner` | Custodian identity (hash of secret key, set at deploy) |
| `liabilitiesRoot` | Salted Merkle-sum root — binds liabilities without revealing balances |
| `reservesSnapshot` | Public reserves figure passed into the circuit |
| `reservesSlot` | Timestamp anchor for anti-replay |
| `solvent` | `disclose(totalLiabilities <= reserves)` — boolean only |
| `published` | Whether a snapshot has been published |

### Private witnesses

These never appear on the ledger; they are supplied at proof time:

| Witness | Role |
|---|---|
| `custodianSecretKey` | Proves caller is the owner |
| `treeHashes` | Full Merkle-sum tree (127 nodes) |
| `treeSums` | Sum heap verified by per-node assertions |
| `leafBalances` | 64 customer balances (zero-padded) |
| `leafSalts` | Per-leaf blinding for salted commitments |

### What `disclose()` controls

- **Published:** `liabilitiesRoot`, `reservesSnapshot`, `reservesSlot`, `solvent`
- **Never published:** `sums[0]` (total liabilities) — only the comparison `sums[0] <= reserves` becomes the public boolean

---

## Preprod deployment

Live on Midnight Preprod:

| | |
|---|---|
| **Network** | Midnight Preprod |
| **Contract** | `0518e4dd6290efef2b8bca3edc38092ff3cbaa14d81575c93109bcb88c7f3acf` |
| **Block** | 1,375,054 |
| **Verdict** | `solvent=true`, `reserves=1,875,000,000` |

Verify on the indexer:

```graphql
# POST https://indexer.preprod.midnight.network/api/v4/graphql
query {
  contractAction(address: "0518e4dd6290efef2b8bca3edc38092ff3cbaa14d81575c93109bcb88c7f3acf") {
    __typename
    transaction { hash block { height timestamp } }
  }
}
```

---

## Screenshots

Level 1 submission proof images:

- [`docs/screenshots/compile-output.png`](docs/screenshots/compile-output.png) — successful `pnpm build:contract`
- [`docs/screenshots/preprod-deploy.png`](docs/screenshots/preprod-deploy.png) — Preprod contract verified on the indexer

---

## Project layout

```
contract/src/por.compact   Compact solvency circuit
src/                       Witnesses, tree builder, simulator
test/solvency.test.ts      Circuit execution tests
docs/screenshots/          Submission screenshots
```

---

## License

Apache 2.0

# Rise In Midnight — Level 2 submission

**Track:** Lace-connected browser DApp that deploys a Compact contract on Preprod and calls `proveSolvency` from the frontend.

| Item | Status | Link / location |
|------|--------|-----------------|
| Public GitHub repository | ✅ | https://github.com/Cryptonean/confidential-por-midnight |
| Live demo (Netlify) | ✅ | https://por-browser.netlify.app |
| README with privacy claim | ✅ | [README.md](./README.md#privacy-claim) |
| Lace connect / disconnect | ✅ | `src/wallet/walletConnector.ts`, `src/components/WalletBar.tsx` |
| Circuit call from frontend | ✅ | `src/por/PorBrowserClient.ts` → `proveSolvency` |
| Observable privacy behavior | ✅ | [Privacy panel](#observable-privacy-behavior) |
| Preprod contract (verifiable) | 📝 | [Fill in after deploy](#preprod-contract-address) |
| Demo video | 📝 | [Recording script](#demo-video-script) |
| ≥ 8 meaningful commits | 📝 | See [COMMITS.md](./COMMITS.md) — split before push |

---

## Requirements to pass (mapped to code)

### 1. Lace wallet connect / disconnect

- **Connect:** `connectToWallet()` in `src/wallet/walletConnector.ts` — DApp connector API `4.x`, auto-detects Lace / 1AM via `window.midnight`.
- **Disconnect:** `disconnectWallet()` clears the session; `usePorSession.disconnect()` resets providers, contract join state, and wallet phase.
- **UI:** `WalletBar` shows wallet picker, Connect, Disconnect, DUST readiness, and stored contract address.

### 2. Circuit called successfully from the frontend

- **Compact circuit:** `compact/por-browser.compact` — N=8 Merkle-sum `proveSolvency` (browser-sized ~18 MB prover key).
- **Build:** `pnpm build:zk` → `src/generated/` + `public/keys|zkir`.
- **Client:** `deployPorContract()` and `submitPorProof()` in `src/por/PorBrowserClient.ts`.
- **Session:** `usePorSession` wires deploy → prove → ledger refresh; success banner shows tx id + block height.

### 3. Observable privacy behavior

Something is **proven without being shown** on-chain:

| Shown in UI (demo) | Published on Midnight ledger | Stays in ZK witness |
|--------------------|------------------------------|---------------------|
| Total liabilities (₳) | ❌ | ✅ |
| Per-customer balances | ❌ | ✅ |
| Solvent verdict | ✅ `solvent` | — |
| Reserves attested | ✅ `reservesSnapshot` | — |
| Liability commitment | ✅ `liabilitiesRoot` (Merkle root only) | — |

**How to demonstrate in the demo video:**

1. Open the **Privacy boundary** panel after a successful prove.
2. Point out **Total liabilities** and **Per-customer balances** marked **Witness only**.
3. Click **Refresh ledger** — on-chain fields update (`solvent`, root, reserves) but **liability total never appears** in ledger state.
4. Optional: toggle **Submit insolvent proof** — proof generation fails or publishes `solvent=false` without revealing individual balances.

### 4. Contract deployed to Preprod with verifiable address

After **Deploy fresh contract** on https://por-browser.netlify.app:

1. Copy the contract address from the wallet bar (or browser DevTools → Application → Local Storage → `por-browser-contract-v3`).
2. Paste it into `submission.preprod.json` (copy from `submission.preprod.example.json`).
3. Verify on the indexer:

```bash
pnpm --filter @por/por-browser verify:preprod -- <CONTRACT_ADDRESS>
```

Or GraphQL (POST `https://indexer.preprod.midnight.network/api/v4/graphql`):

```graphql
query ContractState($address: String!) {
  contractAction(address: $address) {
    __typename
    address
    state
    transaction {
      hash
      block { height timestamp }
    }
  }
}
```

**Example prove transactions** (from local / Netlify testing — replace with your own after fresh deploy):

| Step | Block | Tx prefix |
|------|-------|-----------|
| proveSolvency (1AM + ProofStation) | 1,578,743 | `00c66335146228f6…` |
| proveSolvency (localhost + Docker) | 1,578,620 | `0027e95884ad0bdf…` |

### 5. Minimum 8 meaningful commits

The monorepo already has a deep commit history for the core PoR stack. For the **Level 2 browser package**, split the current `packages/por-browser` work into ≥8 commits before pushing — see [COMMITS.md](./COMMITS.md). **Do not squash** into a single commit.

---

## Submission checklist

- [ ] Push all `packages/por-browser` changes to https://github.com/Cryptonean/Midnight-project
- [ ] Confirm README privacy section is accurate
- [ ] Live demo loads at https://por-browser.netlify.app
- [ ] Record demo video (wallet connect → deploy → prove → privacy panel)
- [ ] Fill `submission.preprod.json` with your deployed contract address
- [ ] Run `pnpm --filter @por/por-browser verify:preprod -- <address>`
- [ ] Submit hackathon form with repo URL, demo URL, contract address, video link

---

## Demo video script (~3–5 min)

1. **Intro** — “Confidential Proof of Reserves, Level 2: prove solvency in the browser without publishing customer balances.”
2. **Live site** — Open https://por-browser.netlify.app (not localhost).
3. **Connect wallet** — Select Lace or 1AM, click Connect, show Preprod network + DUST balance.
4. **Deploy** — Click **Deploy fresh contract**, approve in wallet, show contract address in the bar.
5. **Prove** — Click **proveSolvency from browser**, wait for ProofStation (~1–2 min on N=8), approve submit.
6. **Success** — Show green banner with tx hash and block height.
7. **Privacy** — Scroll to **Privacy boundary**: witness-only liabilities vs on-chain solvent flag + Merkle root.
8. **Disconnect** — Click Disconnect to show clean session teardown.
9. **On-chain** (optional) — Show indexer query or `verify:preprod` output for the contract address.

---

## Preprod contract address

Copy `submission.preprod.example.json` → `submission.preprod.json` and fill in after your Netlify deploy:

```json
{
  "network": "preprod",
  "contractAddress": "<64-char hex from wallet bar>",
  "deployTxId": "<optional>",
  "demoProveTxId": "<from success banner>",
  "demoProveBlock": 1578743,
  "liveDemoUrl": "https://por-browser.netlify.app",
  "repositoryUrl": "https://github.com/Cryptonean/Midnight-project",
  "circuit": "por-browser N=8 proveSolvency"
}
```

`submission.preprod.json` is gitignored if it contains only your personal deploy metadata; the example file is committed as a template.

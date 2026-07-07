# Screenshots (Level 1 submission)

Place proof screenshots here before submitting to Rise In.

| File | What to capture |
|---|---|
| `compile-output.png` | Terminal after `pnpm build:contract` — show `proveSolvency` in the circuit list and a clean exit |
| `preprod-deploy.png` | Preprod deployment proof — indexer GraphQL result or terminal log with contract address |

## Preprod deployment (existing)

- **Network:** Midnight Preprod
- **Contract address:** `0518e4dd6290efef2b8bca3edc38092ff3cbaa14d81575c93109bcb88c7f3acf`
- **Block:** 1,375,054
- **State:** `solvent=true`, `reserves=1,875,000,000`

### Indexer query (for screenshot)

```graphql
# POST https://indexer.preprod.midnight.network/api/v4/graphql
query {
  contractAction(address: "0518e4dd6290efef2b8bca3edc38092ff3cbaa14d81575c93109bcb88c7f3acf") {
    __typename
    transaction { hash block { height timestamp } }
  }
}
```

## Init placeholders

Until you capture real PNGs, `compile-output.init.txt` and `preprod-deploy.init.txt` hold
the expected content. Replace them with `.png` files when ready.

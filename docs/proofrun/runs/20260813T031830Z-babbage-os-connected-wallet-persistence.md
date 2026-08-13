# ProofRun Record: Babbage OS / connected wallet persistence

- ProofRun version: `1`
- Flow definition: `docs/proofrun/flows/babbage-os-connected-wallet-persistence.proofrun.yaml`
- Run ID: `20260813T031830Z-babbage-os-connected-wallet-persistence`
- Started at: `2026-08-13T02:54:00Z`
- Completed at: `2026-08-13T03:18:30Z`
- Outcome: `pass`
- Environment: production, `https://babbageos.com`
- Operator: AI agent
- Wallet: installed and unlocked Metanet Client `0.6.79`; no keys, identity values, plaintext profile data, or private transaction history were recorded

## Deployment identity

- Source commit: `542e645b8c7e97539a85796448c67cf049c0b7ca`
- Workflow run: `31663413852`
- CARS deployment: `233f7e3bea9780f4954f68450715d8ff`
- Project: `a722566348144abe23e2bd7342f3a425`
- Workload: `cars-project-a722566348144abe23e2bd7342f3a425/deployment/cars-project-a722566348144abe23e2bd73-deployment`, two configured replicas

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Wallet connection | pass | Production discovered WalletClient through the installed external wallet and rendered `Connected`; Babbage OS contains no embedded wallet or key material. |
| Permission purpose | pass | The wallet resolved the live Babbage OS `/manifest.json`, identified Babbage OS by name and icon, and presented scoped self-encryption, `babbage os` basket, and profile persistence permissions. |
| Encrypted profile token | pass | The first save created exactly one `profile-v1` output in the `babbage os` basket. A direct WalletClient `listOutputs` check returned one output with valid BEEF; plaintext was never queried or logged. |
| System setting | pass | Theme changed from system to dark, the save completed while connected, and reload restored `.os-root.theme-dark`. Cleanup restored the system preference. |
| Browser profile | pass | A Project Babbage bookmark was added, saved, and visible on the Bookmarks tab after reload. Cleanup removed it and saved the cleaned profile. |
| Desktop layout | pass | The Stuff icon moved from `(24, 28)` to `(40, 28)` with the accessible Alt+Arrow control, saved through WalletClient, and restored at `(40, 28)` after reload. |
| Mobile layout | pass | From System Settings, Convo moved from mobile position 2 to position 1 while the Stuff desktop coordinate stayed `(40, 28)`. Reload restored Convo at position 1 and Stuff at position 2. |
| Layout independence | pass | Desktop and mobile profile transformations are separate and covered by six passing tests. The production flow directly confirmed that mobile reordering did not alter the changed desktop coordinate. |
| Cleanup and repeatability | pass | Mobile order returned to Stuff position 1 / Convo position 2, the Stuff desktop icon returned to `(24, 28)`, and reload confirmed both defaults while the wallet remained connected. |
| Deployment and assets | pass | Workflow `31663413852` passed TypeScript, Vitest, production Vite/CARS builds, CARS balance preflight, and release. Live `/manifest.json` declares `[2, "babbage os"]`; the bundle contains no `babbage-kvstore` reference. |

## Trust, safety, and performance

- Wallet storage uses `@bsv/sdk` `LocalKVStore` with encryption enabled and the production originator passed through every operation.
- The BRC-116 manifest caps monthly Babbage OS storage authorization at 10,000 satoshis, which is also the ProofRun safety cap. No unrelated wallet permissions or private data were accessed.
- Save feedback appeared immediately, remained connected through each mutation, and completed well inside the ten-second approval-to-confirmation threshold after initial permission setup.
- The UI showed no error dialog, guest fallback, layout drift, duplicate token, or unexpected permission request after permissions were established.
- The test bookmark, changed theme, desktop coordinate, and mobile order were all restored before completion.

No critical, high, medium, or low defects remained in this flow after the LocalKVStore, protocol-name, layout-independence, and accessible-control repairs.

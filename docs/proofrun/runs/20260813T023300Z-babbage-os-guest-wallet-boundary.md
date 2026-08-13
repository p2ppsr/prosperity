# ProofRun Record: Babbage OS / guest wallet boundary

- ProofRun version: `1`
- Flow definition: `docs/proofrun/flows/babbage-os-guest-wallet-boundary.proofrun.yaml`
- Run ID: `20260813T023300Z-babbage-os-guest-wallet-boundary`
- Started at: `2026-08-13T02:28:00Z`
- Completed at: `2026-08-13T02:33:00Z`
- Outcome: `pass`
- Environment: production, `https://babbageos.com`
- Operator: AI agent

## Deployment identity

- Source commit: `f367c3e840a9e23e6db26bea2b0521e768abc1ad`
- Workflow run: `31661132468`
- CARS deployment: `3066fb63ef512034d569a2ffbf7e9efd`
- Project: `a722566348144abe23e2bd7342f3a425`
- Workload: `cars-project-a722566348144abe23e2bd7342f3a425/deployment/cars-project-a722566348144abe23e2bd73-deployment`, 2/2 replicas

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Desktop guest surface | pass | Chrome at 1280x720 rendered nine icons, taskbar, and exact viewport width/height with no overflow. |
| Phone home layout | pass | Production at 390x844 rendered nine home icons with body width 390 and no horizontal overflow. |
| Walletless persistence boundary | pass | External Chrome reproduced an indefinitely pending wallet discovery; commit `f367c3e` bounded discovery to 2.5 seconds. The live retest opened the Babbage Go/get-a-wallet dialog in 4.2 seconds with zero console warnings/errors. |
| Feedback | pass | A labeled production readiness probe submitted from the live system tray and the UI returned `Thanks—your feedback is on its way.` |
| TLS and assets | pass | Apex HTML, manifest, SVG icon, and both generated PNG wallpapers returned HTTP 200 over a valid production certificate. |
| Retained application | pass | `https://app.babbageos.com/api/healthz` returned HTTP 200 after apex cutover. |

## Trust and readiness

- Guest exploration does not require a wallet.
- Saving explains WalletClient/Babbage Go and offers wallet installation or continued guest use.
- The feedback payload does not attach wallet identity, files, browsing history, or credentials.
- Connected-wallet encrypted persistence is deliberately tracked by the separate `babbage-os-connected-wallet-persistence` flow and is not claimed by this run.

No critical, high, medium, or low defects remained in this flow after the timeout repair.

# ProofRun Record: Babbage OS / embedded wallet and Stuff

- ProofRun version: `1`
- Flow definition: `docs/proofrun/flows/babbage-os-embedded-wallet-and-stuff.proofrun.yaml`
- Run ID: `20260813T054700Z-babbage-os-embedded-wallet-and-stuff`
- Started at: `2026-08-13T04:58:00Z`
- Completed at: `2026-08-13T05:47:00Z`
- Outcome: `pass`
- Environment: production, `https://babbageos.com`
- Operator: AI agent
- Wallet: installed and unlocked Babbage Go / Metanet Client; no keys, identity values, decrypted file contents, credentials, or private transaction history were recorded

## Deployment identity

- Source commit: `cb503036849e3cf3a784b0bcec335b26951e9611`
- Workflow run: `31671042066`
- CARS deployment: `ff26bcd94b55856cd1bb172870626110`
- Project: `a722566348144abe23e2bd7342f3a425`
- Workload: `cars-project-a722566348144abe23e2bd7342f3a425/deployment/cars-project-a722566348144abe23e2bd73-deployment`, two configured replicas

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Guest Stuff boundary | pass | Stuff opened in production without a wallet. Its write controls kept exploration available and deferred the Babbage Go prompt until a persistence action. |
| Grouped BRC-116 permission | pass | Babbage Go presented one Babbage OS request covering the exact encrypted `babbage os` profile protocol/basket and exact Stuff `filesystem` protocol/basket, with the shared 100,000-satoshi monthly authorization required by the flow. These are the complete LocalKVStore sub-permissions used by the OS, so it does not produce separate storage prompts. Babbage OS does not request AuthFetch or PACT because it does not use them; embedded apps declare their own origin-isolated AuthFetch or counterparty permissions when needed. |
| Stuff file lifecycle | pass | Created `babbage-os-proofrun-2026-08-12.md`, saved it through the encrypted Stuff filesystem, added its `BabbageDesktopFileV1` shortcut to the desktop, reloaded, and reopened it through Stuff. The shortcut was then removed and the synthetic file permanently deleted after explicit operator authorization; Stuff reported the deletion and a fresh root listing contained only the pre-existing `documents` folder. |
| Embedded app wallet access | pass | Convo Messenger, Metanet Docs, and ToDo loaded inside Babbage OS and reached the installed localhost wallet rather than reporting a missing client. Each iframe retained its registered application originator while the OS broker handled the transport. |
| Relay and substrate security | pass | The relay accepts only a registered iframe source, its exact manifest origin, and an allowlisted BRC-100 method. Production iframe policy delegates `local-network`, `loopback-network`, and `local-network-access`; WalletClient can fall through Babbage Go localhost, injected CWI, XDM, and other supported substrates without embedding a wallet in Babbage OS. |
| Desktop behavior | pass | Chrome and Safari desktop validation covered launch, focus, minimize/maximize/restore/close, taskbar state, Stuff lifecycle, embedded apps, Settings, Help, feedback, and independent desktop icon placement. |
| Phone behavior | pass | Chrome CDP and Safari responsive validation at 390 x 844 covered the separate home-screen layout, accessible app labels, full-screen app surfaces, Stuff, and embedded wallet apps without changing desktop icon positions. |
| Settings and app lifecycle | pass | The deployed build exposes theme, light/dark generated wallpapers, custom wallpaper URL, accent, timezone and clock controls, reduced motion, independent mobile ordering, and installed-app removal. Default apps are protected; custom removal also cleans desktop/mobile layout state. |
| Quality and dependencies | pass | TypeScript, 29 Vitest tests in eight files, production Vite/CARS build, and deployment workflow passed. A clean install reported zero npm vulnerabilities and `npm outdated --json` returned no outdated direct dependencies. |
| Catalogue and licensing | pass | The public repository uses the Open BSV License and the live Metanet App Catalogue entry resolves to `babbageos.com` at outpoint `7cdd4cc65e683fe9cd34d4c82fa6cdbb16d00d54665edfc1dd5573be3818cb28.0`. |

## Trust, safety, and repeatability

- Babbage OS ships no wallet keys and no inline BRC-100 wallet. OS persistence uses `WalletClient` and encrypted `LocalKVStore`; embedded apps use their own origin-preserving wallet calls through the locked relay or a browser-supported WalletClient substrate.
- The relay rejects unregistered windows, origin mismatches, non-BRC-100 message shapes, and methods outside the explicit allowlist. The parent never rewrites an embedded app's originator to `babbageos.com`.
- Stuff file contents and OS profile data stay encrypted in the user's wallet. Desktop shortcuts contain portable filesystem metadata and a Stuff URL, not duplicated plaintext content.
- Guest mode remains usable until a save is requested. Wallet discovery and fallback are bounded, and no wallet identity, file content, browser credentials, bookmarks, history, or private app content enters feedback or telemetry.
- The synthetic file and shortcut were both removed. Theme, desktop positions, and mobile order were restored to their pre-run state. The production wallet remained connected and no unexpected permission prompt appeared after the grouped grant.

No critical, high, medium, or low defects remained in this flow after the relay hardening, grouped-permission, Stuff lifecycle, mobile-accessibility, wallpaper, and custom-app lifecycle repairs delivered by pull requests #33 through #36.

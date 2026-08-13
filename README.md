# Babbage OS

Babbage OS is an open-source, BRC-100-native personal computing environment
that runs in a browser. It hosts interoperable Metanet applications in a modern
window manager without embedding wallet keys or shipping its own wallet.

Guests can explore the desktop and open applications. Saving OS settings,
desktop/mobile layouts, browser data, or installed apps uses `WalletClient` and
encrypted `LocalKVStore` records in the user's wallet. When a wallet is absent,
the requested save is paused and the user is offered Babbage Go.

## Development

```bash
npm install
npm run dev
npm run verify
```

## Application integration

Applications are described by `BabbageAppManifestV1` in
`src/types/manifest.ts`. An app declares its launch URL, icon, category,
capabilities, file associations, and preferred window dimensions. URLs must be
HTTPS in production. Apps run in sandboxed iframe windows and may use their own
BRC-100 permissions through the user's external wallet.

Every embedded app frame delegates `local-network`, `loopback-network`, and the
backwards-compatible `local-network-access` permission so modern browsers can
reach WalletClient substrates on localhost. A constrained parent bridge handles
nested XDM requests only for registered frames and forwards them through an
originator-preserving CWI, Cicada, or JSON substrate. App requests remain scoped
to the app's own hostname; they are never charged to `babbageos.com`.

The root `manifest.json` follows BRC-116 and groups only Babbage OS's own
encrypted LocalKVStore and Stuff protocols, baskets, MessageBox AuthFetch
sub-permission, and monthly storage authorization. MessageBox powers the tray's
wallet-authenticated Metanet message and incoming-payment feed. PACT,
certificate, or application storage permissions still belong in each embedded
app's manifest because BRC-116 grants are isolated by originator.

The window manager supports independent minimize, maximize, restore, left-snap,
and right-snap states. Babbage Browser keeps encrypted history, bookmarks, and
credentials in the wallet profile; sites that prohibit iframe embedding receive
an explicit browser-tab handoff instead of an unexplained blank frame.

The taskbar clock can use a conventional wallet-persisted timezone or the
optional Localized Sunrise–Sunset Time system. Localized Time displays `D` and
`N` values relative to local sunrise and sunset. Solar events are calculated on
the device after browser location consent; coordinates are never persisted or
sent to a time service. Its adjacent Help button opens the dedicated manual
article and credits the original `tyweb.us/localized-time.html` system.

Stuff-backed file shortcuts use `BabbageDesktopFileV1`. A shortcut records only
portable filesystem metadata and its Stuff URL; file contents stay under the
Stuff filesystem protocol. MIME and extension associations select a compatible
installed app, with Stuff as the safe fallback.

## Hosting

The project builds as a frontend-only CARS artifact. Production releases are
validated at `https://babbageos.com` and operated through the Network Ops
repository.

## License

[Open BSV License](./LICENSE.txt)

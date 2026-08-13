export type HelpArticle = { id: string; section: string; title: string; body: string[]; sourceUrl?: string }

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'welcome', section: 'Getting started', title: 'Welcome to Babbage OS',
    body: [
      'Babbage OS is a personal computing environment built around BRC-100 apps. You can explore without a wallet. Your external wallet—not this website—holds keys and approves protected actions.',
      'Double-click a desktop icon or choose an app from the launcher. On a phone, tap an icon on the home screen. Open apps keep their own wallet permission flows.'
    ]
  },
  {
    id: 'wallet', section: 'Getting started', title: 'Wallets and guest mode',
    body: [
      'Guest mode can launch apps and lets you explore every OS surface. Babbage OS asks for Babbage Go only when you save a preference, layout, bookmark, credential, installed app, or desktop file.',
      'Babbage OS uses the standard WalletClient bridge. It never embeds a private key, recovery phrase, or wallet implementation.',
      'Embedded apps can discover wallets through localhost, injected CWI, Cicada, secure JSON, JSON API, React Native, or XDM substrates. Babbage OS delegates loopback access and relays nested XDM requests only from the registered app frame while preserving that app domain as the originator.'
    ]
  },
  {
    id: 'permissions', section: 'Getting started', title: 'Grouped permissions and PACT',
    body: [
      'Babbage OS follows BRC-116. Its first protected operation can show one grouped prompt covering the exact LocalKVStore and Stuff protocols, the MessageBox AuthFetch sub-permission, basket access, and monthly storage spending authorization declared at /manifest.json.',
      'Permissions are isolated by originator. Apps such as Convo, Tempo, or BitGenius therefore use their own domain manifests for AuthFetch, storage, certificates, spending, and other app-specific permissions. Babbage OS must not impersonate them or combine unrelated permissions under the babbageos.com grant.',
      'PACT is separate from ordinary app permissions. When an app communicates with a new peer through Level 2 protocols, its own BRC-116 counterpartyPermissions declaration lets the wallet present one peer-specific trust prompt. Babbage OS itself does not request PACT because its profile, Stuff, and notification feed use only the self counterparty.'
    ]
  },
  {
    id: 'windows', section: 'Desktop', title: 'Windows and the taskbar',
    body: [
      'Drag a title bar to move a window. Drag an edge or corner to resize. Use the title-bar controls to snap left, snap right, minimize, maximize, restore, or close. Selecting a window or its taskbar button brings it forward.',
      'The launcher shows every installed app. The tray contains wallet state, feedback, Help Center, settings, and the clock in your selected timezone.'
    ]
  },
  {
    id: 'layouts', section: 'Desktop', title: 'Desktop and mobile layouts',
    body: [
      'Desktop icon positions and mobile home-screen order are separate. Moving an icon on one device class never changes its placement on the other.',
      'Desktop positions are saved after a drag. For precise or keyboard-only placement, focus an icon, hold Alt, and use the arrow keys.',
      'Mobile apps can be reordered on the phone home screen or from System Settings on desktop. Both controls update only mobile order.'
    ]
  },
  {
    id: 'files', section: 'Files', title: 'Stuff files on your desktop',
    body: [
      'Stuff is the filesystem and default file explorer. A desktop file shortcut stores a portable Stuff URL plus safe metadata—not a second copy of file contents.',
      'Open a file in Stuff and choose Add to desktop. Babbage OS records the BabbageDesktopFileV1 shortcut, chooses an installed app by exact MIME type or extension, and falls back to Stuff. Open it again and choose Remove from desktop to remove only the shortcut; deleting a Stuff file also removes its desktop shortcut automatically.'
    ]
  },
  {
    id: 'browser', section: 'Apps', title: 'Babbage Browser',
    body: [
      'The Browser app opens HTTPS pages inside a managed OS window when the site permits framing. Google, DuckDuckGo, Metanet Apps, and other sites that prohibit iframe embedding get a clear Open in browser tab handoff; any unexpectedly blank page has the same always-visible action.',
      'Bookmarks, history, and credentials are part of your encrypted Local KV Store profile. Credentials are never written to browser localStorage or sent to the opened website by Babbage OS.'
    ]
  },
  {
    id: 'notifications', section: 'Apps', title: 'Messages, payments, and BitGenius',
    body: [
      'The tray notification center retrieves Metanet activity from your wallet-authenticated MessageBox. Incoming payment notifications are accepted through WalletClient, and message links open in the matching installed app when possible.',
      'Use the BitGenius sparkle in the taskbar or the BitGenius icon in the phone dock to open your agent chat. The embedded app keeps its own origin and reaches Babbage Go through the secure wallet bridge.',
      'Optional browser alerts can be enabled in System Settings. Babbage OS asks the browser for notification permission only when you turn them on.'
    ]
  },
  {
    id: 'apps', section: 'Apps', title: 'Installing an app',
    body: [
      'Open the launcher and choose Add app. Provide a name and HTTPS launch URL. The app is installed into your wallet-backed profile and appears on both desktop and mobile home screens.',
      'BabbageAppManifestV1 is the portable integration contract. It defines identity, launch kind, category, capabilities, window preferences, and optional file associations.',
      'To uninstall an app you added, open System Settings and use Remove in Installed apps. Babbage OS removes its desktop and phone shortcuts without deleting data owned by the app.'
    ]
  },
  {
    id: 'settings', section: 'Personalization', title: 'Themes, wallpaper, and clock',
    body: [
      'System Settings controls light, dark, or automatic theme; generated Babbage Dawn and Babbage Midnight wallpapers; custom wallpaper URLs; accent color; motion; and either a conventional timezone clock or Localized Time.',
      'Saving settings writes the encrypted profile through your wallet. Theme previews take effect immediately.'
    ]
  },
  {
    id: 'localized-time', section: 'Personalization', title: 'Localized Sunrise–Sunset Time',
    sourceUrl: 'https://tyweb.us/localized-time.html',
    body: [
      'Localized Time is an optional clock system based on the natural rhythm of sunrise and sunset at your current location. Choose Localized Time under System Settings → Time & motion. The normal timezone clock remains the default.',
      'D means time relative to sunrise; N means time relative to sunset. Positive values are time since that event and negative values are time until it. For example, D1:00 is one hour after sunrise, N-:30 is thirty minutes before sunset, and D-1:00 is one hour before sunrise.',
      'The first taskbar line shows the active day or night reference. The smaller second line is the crossworld value for the other solar transition. As in the original system, Babbage OS changes references one hour before sunrise or sunset so the approaching transition is immediately visible.',
      'Babbage OS asks for browser location permission only after you select Localized Time. Sunrise and sunset are calculated locally on your device. Coordinates are not stored in your wallet, retained by Babbage OS, or sent to a time service. If permission is unavailable, the clock shows Location needed; return to browser site settings to enable location or select Timezone time.'
    ]
  },
  {
    id: 'privacy', section: 'Safety', title: 'Privacy and security model',
    body: [
      'Babbage OS delegates all identity, signing, encryption, and transaction consent to WalletClient. It does not receive wallet private keys.',
      'Apps run in sandboxed iframes with forms, scripts, downloads, popups, and same-origin access limited to their own origin. Local and loopback network access is explicitly delegated so WalletClient can reach a wallet running on the user’s machine. Nested wallet messages are accepted only from the registered frame and exact launch origin.'
    ]
  },
  {
    id: 'recovery', section: 'Safety', title: 'If an app or save does not work',
    body: [
      'Check the tray wallet indicator, unlock Babbage Go, and retry. If an embedded page stays blank, use Open externally from its window.',
      'A failed wallet save leaves the current in-memory session intact. Nothing is silently persisted in unencrypted browser storage. If an app cannot see the wallet inside its window, use Open externally and send feedback so the app origin and substrate can be checked.'
    ]
  },
  {
    id: 'feedback', section: 'Support', title: 'Send feedback',
    body: [
      'Choose the speech-bubble icon in the system tray. Describe what worked, what got in your way, or what you want next. Contact details are optional.',
      'Feedback sends only the fields shown in the form plus coarse OS surface and release metadata. It does not include wallet identity, files, browsing data, credentials, or app content.'
    ]
  }
]

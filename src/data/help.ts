export type HelpArticle = { id: string; section: string; title: string; body: string[] }

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
      'Babbage OS follows BRC-116. Its first protected profile operation can show one grouped prompt covering the exact LocalKVStore encryption protocol, basket access, and monthly storage spending authorization declared at /manifest.json.',
      'Permissions are isolated by originator. Apps such as Convo, Tempo, or BitGenius therefore use their own domain manifests for AuthFetch, storage, certificates, spending, and other app-specific permissions. Babbage OS must not impersonate them or combine unrelated permissions under the babbageos.com grant.',
      'PACT is separate from ordinary app permissions. When an app communicates with a new peer through Level 2 protocols, its own BRC-116 counterpartyPermissions declaration lets the wallet present one peer-specific trust prompt. Babbage OS itself does not request PACT because its private profile uses only the self counterparty.'
    ]
  },
  {
    id: 'windows', section: 'Desktop', title: 'Windows and the taskbar',
    body: [
      'Drag a title bar to move a window. Drag an edge or corner to resize. Use the title-bar controls to minimize, maximize, restore, or close. Selecting a window or its taskbar button brings it forward.',
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
      'The Browser app opens HTTPS pages inside a managed OS window when the site permits framing. Use Open externally if a site declines to render in a frame.',
      'Bookmarks, history, and credentials are part of your encrypted Local KV Store profile. Credentials are never written to browser localStorage or sent to the opened website by Babbage OS.'
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
      'System Settings controls light, dark, or automatic theme; generated Babbage Dawn and Babbage Midnight wallpapers; custom wallpaper URLs; accent color; motion; timezone; and clock format.',
      'Saving settings writes the encrypted profile through your wallet. Theme previews take effect immediately.'
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

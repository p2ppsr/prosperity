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
      'Babbage OS uses the standard WalletClient bridge. It never embeds a private key, recovery phrase, or wallet implementation.'
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
      'Desktop positions are saved after a drag. Mobile apps can be reordered with drag and drop.'
    ]
  },
  {
    id: 'files', section: 'Files', title: 'Stuff files on your desktop',
    body: [
      'Stuff is the filesystem and default file explorer. A desktop file shortcut stores a portable Stuff URL plus safe metadata—not a second copy of file contents.',
      'Stuff can send a babbage-os:add-desktop-file message using the BabbageDesktopFileV1 contract. You can also add a Stuff URL from the launcher. Babbage OS chooses an installed app by MIME type or extension and falls back to Stuff.'
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
      'Open the launcher and choose Add app. Provide a name and HTTPS launch URL. The app is installed only into your wallet-backed profile.',
      'BabbageAppManifestV1 is the portable integration contract. It defines identity, launch kind, category, capabilities, window preferences, and optional file associations.'
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
      'Apps run in sandboxed iframes with forms, scripts, downloads, popups, and same-origin access limited to their own origin. Babbage OS accepts structured file messages only from the configured Stuff origin.'
    ]
  },
  {
    id: 'recovery', section: 'Safety', title: 'If an app or save does not work',
    body: [
      'Check the tray wallet indicator, unlock Babbage Go, and retry. If an embedded page stays blank, use Open externally from its window.',
      'A failed wallet save leaves the current in-memory session intact. Nothing is silently persisted in unencrypted browser storage.'
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

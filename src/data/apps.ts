import type { BabbageAppManifestV1 } from '../types/manifest'

const iframeApp = (
  app: Omit<BabbageAppManifestV1, 'schema' | 'schemaVersion' | 'launch'> & { url: string }
): BabbageAppManifestV1 => ({
  ...app,
  schema: 'babbage-os-app',
  schemaVersion: '1.0',
  launch: { kind: 'iframe', url: app.url }
})

const internalApp = (
  app: Omit<BabbageAppManifestV1, 'schema' | 'schemaVersion' | 'launch'>
): BabbageAppManifestV1 => ({
  ...app,
  schema: 'babbage-os-app',
  schemaVersion: '1.0',
  launch: { kind: 'internal', url: `babbage://${app.id}` }
})

export const DEFAULT_APPS: BabbageAppManifestV1[] = [
  internalApp({
    id: 'stuff', name: 'Stuff', shortName: 'Stuff', icon: 'folder', category: 'files', featured: true,
    description: 'Your wallet-backed filesystem and file explorer.',
    capabilities: ['wallet', 'files'],
    fileAssociations: [{ extensions: ['*'], mimeTypes: ['*/*'], role: 'viewer' }],
    window: { width: 980, height: 680, minWidth: 560, minHeight: 380 }
  }),
  iframeApp({
    id: 'convo', name: 'Convo Messenger', shortName: 'Convo', icon: 'messages', category: 'communication', featured: true,
    description: 'Private wallet-encrypted conversations.', url: 'https://convo.metanet.app', capabilities: ['wallet', 'communication'],
    window: { width: 900, height: 720, minWidth: 420, minHeight: 520 }
  }),
  iframeApp({
    id: 'metanet-docs', name: 'Metanet Docs', shortName: 'Docs', icon: 'document', category: 'productivity', featured: true,
    description: 'Portable documents and real-time collaboration.', url: 'https://docs.metanet.app', capabilities: ['wallet', 'files', 'communication'],
    fileAssociations: [{ extensions: ['md', 'txt', 'doc', 'docx'], mimeTypes: ['text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], role: 'editor' }],
    window: { width: 1100, height: 760, minWidth: 620, minHeight: 480 }
  }),
  iframeApp({
    id: 'todo', name: 'ToDo', shortName: 'ToDo', icon: 'check-square', category: 'productivity', featured: true,
    description: 'Reward-aware tasks backed by your wallet.', url: 'https://todo.metanet.app', capabilities: ['wallet'],
    window: { width: 760, height: 650, minWidth: 420, minHeight: 480 }
  }),
  iframeApp({
    id: 'bitgenius', name: 'BitGenius', shortName: 'BitGenius', icon: 'sparkles', category: 'creative', featured: true,
    description: 'AI assistance built for the Metanet.', url: 'https://bitgenius.net/app', capabilities: ['wallet', 'ai'],
    window: { width: 1040, height: 740, minWidth: 520, minHeight: 480 }
  }),
  internalApp({
    id: 'browser', name: 'Babbage Browser', shortName: 'Browser', icon: 'globe', category: 'utilities', featured: true,
    description: 'A private web workspace with encrypted bookmarks, history, and credentials.', capabilities: ['wallet'],
    window: { width: 1080, height: 740, minWidth: 620, minHeight: 450 }
  }),
  iframeApp({
    id: 'tempo', name: 'Tempo', shortName: 'Tempo', icon: 'music', category: 'creative', featured: true,
    description: 'Discover, publish, purchase, and play music.', url: 'https://tempomusic.net', capabilities: ['wallet', 'media'],
    window: { width: 1040, height: 720, minWidth: 560, minHeight: 420 }
  }),
  iframeApp({
    id: 'papertrade', name: 'PaperTrade', shortName: 'PaperTrade', icon: 'newspaper', category: 'finance',
    description: 'Read and unlock the Metanet newsstand.', url: 'https://papertrade.metanet.app', capabilities: ['wallet'],
    fileAssociations: [{ extensions: ['pdf'], mimeTypes: ['application/pdf'], role: 'viewer' }],
    window: { width: 960, height: 720, minWidth: 520, minHeight: 440 }
  }),
  iframeApp({
    id: 'pollr', name: 'Pollr', shortName: 'Pollr', icon: 'chart', category: 'communication',
    description: 'Create and participate in verifiable polls.', url: 'https://pollr.gg', capabilities: ['wallet'],
    window: { width: 850, height: 680, minWidth: 440, minHeight: 420 }
  }),
  iframeApp({
    id: 'academy', name: 'Metanet Academy', shortName: 'Academy', icon: 'graduation', category: 'productivity',
    description: 'Learn Bitcoin and Metanet development.', url: 'https://metanetacademy.com', capabilities: [],
    window: { width: 1040, height: 720, minWidth: 560, minHeight: 420 }
  }),
  internalApp({
    id: 'settings', name: 'System Settings', shortName: 'Settings', icon: 'settings', category: 'system', featured: true,
    description: 'Personalize your Babbage OS experience.', capabilities: ['wallet'],
    window: { width: 760, height: 650, minWidth: 520, minHeight: 480 }
  }),
  internalApp({
    id: 'help', name: 'Help Center', shortName: 'Help', icon: 'help', category: 'system', featured: true,
    description: 'Search the complete Babbage OS user manual.', capabilities: [],
    window: { width: 920, height: 700, minWidth: 560, minHeight: 460 }
  }),
  internalApp({
    id: 'feedback', name: 'Babbage OS Feedback', shortName: 'Feedback', icon: 'message-circle', category: 'system',
    description: 'Send product feedback from the system tray.', capabilities: ['communication'],
    window: { width: 560, height: 560, minWidth: 420, minHeight: 440 }
  })
]

export const DEFAULT_DESKTOP_APP_IDS = ['stuff', 'convo', 'metanet-docs', 'todo', 'bitgenius', 'browser', 'tempo', 'settings', 'help']

export const getDefaultDesktopItems = () => DEFAULT_DESKTOP_APP_IDS.map((targetId, index) => ({
  id: `desktop-${targetId}`,
  kind: 'app' as const,
  targetId,
  x: 24 + Math.floor(index / 6) * 104,
  y: 28 + (index % 6) * 104
}))

export const getDefaultMobileItems = () => DEFAULT_APPS.filter((app) => app.featured).map((app, order) => ({
  id: `mobile-${app.id}`,
  kind: 'app' as const,
  targetId: app.id,
  order
}))

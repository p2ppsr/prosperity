export type AppCategory =
  | 'files'
  | 'communication'
  | 'productivity'
  | 'creative'
  | 'finance'
  | 'utilities'
  | 'system'

export type FileAssociation = {
  extensions?: string[]
  mimeTypes?: string[]
  role: 'viewer' | 'editor'
}

export type BabbageAppManifestV1 = {
  schema: 'babbage-os-app'
  schemaVersion: '1.0'
  id: string
  name: string
  shortName: string
  description: string
  launch: { kind: 'iframe' | 'internal'; url: string }
  icon: string
  category: AppCategory
  capabilities: Array<'wallet' | 'files' | 'communication' | 'ai' | 'media'>
  fileAssociations?: FileAssociation[]
  window: { width: number; height: number; minWidth: number; minHeight: number }
  featured?: boolean
}

export type BabbageDesktopFileV1 = {
  schema: 'babbage-os-desktop-file'
  schemaVersion: '1.0'
  id: string
  name: string
  stuffUrl: string
  mimeType: string
  extension?: string
  preferredAppId?: string
  createdAt: string
}

export type DesktopItem = {
  id: string
  kind: 'app' | 'file'
  targetId: string
  x: number
  y: number
}

export type MobileItem = {
  id: string
  kind: 'app' | 'file'
  targetId: string
  order: number
}

export type WindowBounds = { x: number; y: number; width: number; height: number }

export type WindowState = WindowBounds & {
  id: string
  appId: string
  title: string
  url?: string
  minimized: boolean
  maximized: boolean
  snap?: 'left' | 'right'
  zIndex: number
  restoreBounds?: WindowBounds
}

export type ThemePreference = 'system' | 'light' | 'dark'

export type SystemSettings = {
  theme: ThemePreference
  wallpaper: 'babbage-dawn' | 'babbage-midnight' | 'custom'
  customWallpaperUrl: string
  timezone: string
  clock24Hour: boolean
  accent: 'cyan' | 'violet' | 'coral' | 'green'
  reduceMotion: boolean
  showSeconds: boolean
  desktopNotifications: boolean
  timeMode: 'timezone' | 'localized'
}

export type BrowserBookmark = { id: string; title: string; url: string }
export type BrowserHistoryEntry = BrowserBookmark & { visitedAt: string }
export type BrowserCredential = { id: string; origin: string; username: string; password: string }

export type PersistedProfileV1 = {
  schema: 'babbage-os-profile'
  schemaVersion: '1.0'
  settings: SystemSettings
  desktopItems: DesktopItem[]
  mobileItems: MobileItem[]
  installedApps: BabbageAppManifestV1[]
  desktopFiles: BabbageDesktopFileV1[]
  browser: {
    bookmarks: BrowserBookmark[]
    history: BrowserHistoryEntry[]
    credentials: BrowserCredential[]
  }
}

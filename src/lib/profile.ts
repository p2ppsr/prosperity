import type { LocalKVStore, WalletClient } from '@bsv/sdk'

import { DEFAULT_APPS, getDefaultDesktopItems, getDefaultMobileItems } from '../data/apps'
import type { PersistedProfileV1, SystemSettings } from '../types/manifest'

export const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'system',
  wallpaper: 'babbage-midnight',
  customWallpaperUrl: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  clock24Hour: false,
  accent: 'cyan',
  reduceMotion: false,
  showSeconds: false
}

export const createDefaultProfile = (): PersistedProfileV1 => ({
  schema: 'babbage-os-profile',
  schemaVersion: '1.0',
  settings: { ...DEFAULT_SETTINGS },
  desktopItems: getDefaultDesktopItems(),
  mobileItems: getDefaultMobileItems(),
  installedApps: [...DEFAULT_APPS],
  desktopFiles: [],
  browser: { bookmarks: [], history: [], credentials: [] }
})

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value)

export const normalizeProfile = (value: unknown): PersistedProfileV1 | undefined => {
  if (!isRecord(value) || value.schema !== 'babbage-os-profile' || value.schemaVersion !== '1.0') return undefined
  const defaults = createDefaultProfile()
  const settings = isRecord(value.settings) ? value.settings : {}
  const browser = isRecord(value.browser) ? value.browser : {}
  const savedApps = Array.isArray(value.installedApps) ? value.installedApps : []
  const defaultIds = new Set(defaults.installedApps.map((app) => app.id))
  const customApps = savedApps.filter((app): app is PersistedProfileV1['installedApps'][number] =>
    isRecord(app) && typeof app.id === 'string' && app.schema === 'babbage-os-app' && !defaultIds.has(app.id)
  )
  const savedDesktop = Array.isArray(value.desktopItems) ? value.desktopItems : []
  const savedMobile = Array.isArray(value.mobileItems) ? value.mobileItems : []
  const desktopItems = [
    ...defaults.desktopItems.map((item) => savedDesktop.find((saved) => isRecord(saved) && saved.id === item.id) as typeof item | undefined ?? item),
    ...savedDesktop.filter((item): item is PersistedProfileV1['desktopItems'][number] => isRecord(item) && typeof item.id === 'string' && !defaults.desktopItems.some((candidate) => candidate.id === item.id))
  ]
  const normalizedSavedMobile = savedMobile.filter((item): item is PersistedProfileV1['mobileItems'][number] => isRecord(item) && typeof item.id === 'string' && typeof item.order === 'number')
  const mobileItems = [
    ...normalizedSavedMobile,
    ...defaults.mobileItems.filter((item) => !normalizedSavedMobile.some((saved) => saved.id === item.id))
      .map((item, index) => ({ ...item, order: normalizedSavedMobile.length + index }))
  ].sort((a, b) => a.order - b.order).map((item, order) => ({ ...item, order }))
  const validTimezone = typeof settings.timezone === 'string' && (() => {
    try { new Intl.DateTimeFormat(undefined, { timeZone: settings.timezone as string }); return true } catch { return false }
  })()
  return {
    ...defaults,
    settings: {
      ...defaults.settings,
      ...(settings as Partial<SystemSettings>),
      timezone: validTimezone ? settings.timezone as string : defaults.settings.timezone
    },
    installedApps: [...defaults.installedApps, ...customApps],
    desktopItems,
    mobileItems,
    desktopFiles: Array.isArray(value.desktopFiles) ? value.desktopFiles as PersistedProfileV1['desktopFiles'] : [],
    browser: {
      bookmarks: Array.isArray(browser.bookmarks) ? browser.bookmarks as PersistedProfileV1['browser']['bookmarks'] : [],
      history: Array.isArray(browser.history) ? browser.history as PersistedProfileV1['browser']['history'] : [],
      credentials: Array.isArray(browser.credentials) ? browser.credentials as PersistedProfileV1['browser']['credentials'] : []
    }
  }
}

export const removeInstalledApp = (profile: PersistedProfileV1, id: string): PersistedProfileV1 => {
  if (DEFAULT_APPS.some((app) => app.id === id) || !profile.installedApps.some((app) => app.id === id)) return profile
  return {
    ...profile,
    installedApps: profile.installedApps.filter((app) => app.id !== id),
    desktopItems: profile.desktopItems.filter((item) => !(item.kind === 'app' && item.targetId === id)),
    mobileItems: profile.mobileItems
      .filter((item) => !(item.kind === 'app' && item.targetId === id))
      .sort((a, b) => a.order - b.order)
      .map((item, order) => ({ ...item, order }))
  }
}

const PROFILE_KEY = 'profile-v1'
// LocalKVStore uses the context as both a basket and a level-2 BRC-100
// protocol name. Protocol names allow letters, numbers, and spaces only.
const CONTEXT = 'babbage os'
const WALLET_DISCOVERY_TIMEOUT_MS = 2500

function withTimeout<T>(operation: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(message)), timeoutMs)
    operation.then(
      (value) => { window.clearTimeout(timeout); resolve(value) },
      (error) => { window.clearTimeout(timeout); reject(error) }
    )
  })
}

export class WalletProfileStore {
  private runtime?: Promise<{ wallet: WalletClient; kv: LocalKVStore }>

  private getRuntime() {
    if (!this.runtime) {
      this.runtime = import('@bsv/sdk').then((sdk) => {
        const wallet = new sdk.WalletClient('auto', window.location.hostname)
        return {
          wallet,
          kv: new sdk.LocalKVStore(wallet, CONTEXT, true, window.location.hostname)
        }
      })
    }
    return this.runtime
  }

  async isConnected(): Promise<boolean> {
    try {
      const { wallet } = await this.getRuntime()
      const result = await withTimeout(
        wallet.isAuthenticated({}),
        WALLET_DISCOVERY_TIMEOUT_MS,
        'No wallet responded.'
      )
      return result.authenticated === true
    } catch {
      return false
    }
  }

  async connect(): Promise<void> {
    const { wallet } = await this.getRuntime()
    await wallet.waitForAuthentication({})
  }

  async load(): Promise<PersistedProfileV1 | undefined> {
    const { kv } = await this.getRuntime()
    const value = await kv.get(PROFILE_KEY)
    if (!value) return undefined
    return normalizeProfile(JSON.parse(value))
  }

  async save(profile: PersistedProfileV1): Promise<void> {
    const { kv } = await this.getRuntime()
    await kv.set(PROFILE_KEY, JSON.stringify(profile))
  }
}

export const walletProfileStore = new WalletProfileStore()

export const walletInstallUrl = () => {
  const target = new URL('https://getmetanet.com/open')
  target.searchParams.set('returnUrl', window.location.href)
  target.searchParams.set('app', 'Babbage OS')
  target.searchParams.set('source', 'babbage-os')
  return target.toString()
}

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
  installedApps: DEFAULT_APPS,
  desktopFiles: [],
  browser: { bookmarks: [], history: [], credentials: [] }
})

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
    const parsed = JSON.parse(value) as Partial<PersistedProfileV1>
    if (parsed.schema !== 'babbage-os-profile' || parsed.schemaVersion !== '1.0') return undefined
    const defaults = createDefaultProfile()
    return {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...parsed.settings },
      browser: { ...defaults.browser, ...parsed.browser }
    }
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

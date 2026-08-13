import type { LocalKVStore, WalletClient } from '@bsv/sdk'

export type StuffFolderEntry = { id: string; name: string; type: 'folder' | 'file'; mimeType?: string }
export type StuffFolder = { type: 'folder'; nodes: StuffFolderEntry[] }
export type StuffFile = { type: 'file'; contents: string; mimeType: string }
export type StuffNode = StuffFolder | StuffFile

const CONTEXT = 'filesystem'
const ORIGINATOR = () => window.location.hostname
const DISCOVERY_TIMEOUT_MS = 2500

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('No wallet responded.')), timeoutMs)
    operation.then(
      (value) => { window.clearTimeout(timer); resolve(value) },
      (error) => { window.clearTimeout(timer); reject(error) }
    )
  })
}

export class StuffFilesystemStore {
  private runtime?: Promise<{ wallet: WalletClient; kv: LocalKVStore }>

  private getRuntime() {
    if (!this.runtime) {
      this.runtime = import('@bsv/sdk').then((sdk) => {
        const wallet = new sdk.WalletClient('auto', ORIGINATOR())
        return { wallet, kv: new sdk.LocalKVStore(wallet, CONTEXT, true, ORIGINATOR()) }
      })
    }
    return this.runtime
  }

  async isConnected() {
    try {
      const { wallet } = await this.getRuntime()
      return (await withTimeout(wallet.isAuthenticated({}), DISCOVERY_TIMEOUT_MS)).authenticated === true
    } catch {
      return false
    }
  }

  async connect() {
    const { wallet } = await this.getRuntime()
    await wallet.waitForAuthentication({})
  }

  async get(id: string): Promise<StuffNode | undefined> {
    const { kv } = await this.getRuntime()
    const value = await kv.get(id)
    if (!value) return undefined
    const parsed = JSON.parse(value) as Partial<StuffNode>
    if (parsed.type === 'folder' && Array.isArray(parsed.nodes)) return parsed as StuffFolder
    if (parsed.type === 'file' && typeof parsed.contents === 'string') {
      return { type: 'file', contents: parsed.contents, mimeType: typeof parsed.mimeType === 'string' ? parsed.mimeType : 'text/plain' }
    }
    throw new Error('This Stuff node is not valid.')
  }

  async set(id: string, node: StuffNode) {
    const { kv } = await this.getRuntime()
    await kv.set(id, JSON.stringify(node))
  }

  async remove(id: string) {
    const { kv } = await this.getRuntime()
    await kv.remove(id)
  }
}

export const stuffFilesystemStore = new StuffFilesystemStore()

export function mimeTypeForName(name: string) {
  const extension = name.split('.').pop()?.toLowerCase()
  const types: Record<string, string> = {
    txt: 'text/plain', md: 'text/markdown', json: 'application/json',
    html: 'text/html', css: 'text/css', js: 'text/javascript', ts: 'text/typescript',
    csv: 'text/csv', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg',
    jpeg: 'image/jpeg', gif: 'image/gif', pdf: 'application/pdf'
  }
  return extension ? types[extension] ?? 'application/octet-stream' : 'text/plain'
}

export function stuffUrlForNode(id: string) {
  const url = new URL('/', window.location.origin)
  url.hash = `stuff=${encodeURIComponent(id)}`
  return url.toString()
}

export function nodeIdFromStuffUrl(value?: string) {
  if (!value) return undefined
  try {
    const hash = new URL(value).hash
    return hash.startsWith('#stuff=') ? decodeURIComponent(hash.slice('#stuff='.length)) : undefined
  } catch {
    return undefined
  }
}

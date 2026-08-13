export const EMBEDDED_APP_PERMISSIONS = [
  'clipboard-read',
  'clipboard-write',
  'camera',
  'microphone',
  'fullscreen',
  'local-network-access',
  'local-network',
  'loopback-network'
].join('; ')

export const WALLET_METHODS = [
  'createAction', 'signAction', 'abortAction', 'listActions', 'internalizeAction',
  'listOutputs', 'relinquishOutput', 'getPublicKey', 'revealCounterpartyKeyLinkage',
  'revealSpecificKeyLinkage', 'encrypt', 'decrypt', 'createHmac', 'verifyHmac',
  'createSignature', 'verifySignature', 'acquireCertificate', 'listCertificates',
  'proveCertificate', 'relinquishCertificate', 'discoverByIdentityKey',
  'discoverByAttributes', 'isAuthenticated', 'waitForAuthentication', 'getHeight',
  'getHeaderForHeight', 'getNetwork', 'getVersion'
] as const

type WalletMethod = typeof WALLET_METHODS[number]
type WalletInvoker = Record<WalletMethod, (args: never) => Promise<unknown>>
type FrameSource = { postMessage: (message: unknown, targetOrigin: string) => void }
type WalletFactory = (originator: string) => Promise<WalletInvoker>

type CWIInvocation = {
  type: 'CWI'
  isInvocation: true
  id: string
  call: WalletMethod
  args: unknown
}

const methodSet = new Set<string>(WALLET_METHODS)
const SUBSTRATE_TIMEOUT_MS = 1800

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Wallet substrate timed out.')), timeoutMs)
    operation.then(
      (value) => { window.clearTimeout(timer); resolve(value) },
      (error) => { window.clearTimeout(timer); reject(error) }
    )
  })
}

async function createOriginatorPreservingWallet(originator: string): Promise<WalletInvoker> {
  const { WalletClient: SDKWalletClient } = await import('@bsv/sdk')
  const substrates: Array<'window.CWI' | 'Cicada' | 'secure-json-api' | 'json-api' | 'react-native' | 'XDM'> =
    ['window.CWI', 'Cicada', 'secure-json-api', 'json-api', 'react-native']
  if (window.parent !== window) substrates.push('XDM')
  try {
    const connected = await Promise.any(substrates.map(async (substrate) => {
    const wallet = new SDKWalletClient(substrate, originator)
    await withTimeout(wallet.getVersion({}), SUBSTRATE_TIMEOUT_MS)
    return wallet
    }))
    return connected as unknown as WalletInvoker
  } catch {
    throw new Error('No originator-preserving wallet substrate is available to this embedded app.')
  }
}

function isInvocation(value: unknown): value is CWIInvocation {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CWIInvocation>
  return candidate.type === 'CWI' && candidate.isInvocation === true &&
    typeof candidate.id === 'string' && candidate.id.length > 0 &&
    typeof candidate.call === 'string' && methodSet.has(candidate.call)
}

function walletError(error: unknown) {
  const candidate = error as { message?: unknown; description?: unknown; code?: unknown }
  return {
    description: typeof candidate?.description === 'string' ? candidate.description
      : typeof candidate?.message === 'string' ? candidate.message
        : 'The wallet request failed.',
    code: typeof candidate?.code === 'number' && Number.isSafeInteger(candidate.code) ? candidate.code : 1
  }
}

export class FrameWalletBridge {
  private readonly frames = new Map<FrameSource, { origin: string; originator: string }>()
  private readonly wallets = new Map<string, Promise<WalletInvoker>>()
  private listening = false

  constructor(private readonly walletFactory: WalletFactory = createOriginatorPreservingWallet) {}

  registerSource(source: FrameSource, launchUrl: string) {
    const url = new URL(launchUrl)
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
      throw new Error('Wallet-enabled app frames must use HTTPS or localhost.')
    }
    this.frames.set(source, { origin: url.origin, originator: url.hostname })
    if (!this.wallets.has(url.hostname)) {
      const warmWallet = this.walletFactory(url.hostname)
      this.wallets.set(url.hostname, warmWallet)
      warmWallet.catch(() => this.wallets.delete(url.hostname))
    }
    return () => { this.frames.delete(source) }
  }

  registerFrame(frame: HTMLIFrameElement, launchUrl: string) {
    if (!frame.contentWindow) return () => {}
    return this.registerSource(frame.contentWindow, launchUrl)
  }

  start() {
    if (this.listening) return
    window.addEventListener('message', this.handleMessage)
    this.listening = true
  }

  stop() {
    if (!this.listening) return
    window.removeEventListener('message', this.handleMessage)
    this.listening = false
  }

  handleMessage = async (event: MessageEvent) => {
    const source = event.source as FrameSource | null
    const registration = source ? this.frames.get(source) : undefined
    if (!source || !registration || event.origin !== registration.origin || !isInvocation(event.data)) return false

    const invocation = event.data
    try {
      let wallet = this.wallets.get(registration.originator)
      if (!wallet) {
        wallet = this.walletFactory(registration.originator)
        this.wallets.set(registration.originator, wallet)
        wallet.catch(() => this.wallets.delete(registration.originator))
      }
      const connected = await wallet
      const result = await connected[invocation.call](invocation.args as never)
      source.postMessage({ type: 'CWI', isInvocation: false, id: invocation.id, status: 'success', result }, event.origin)
    } catch (error) {
      const normalized = walletError(error)
      source.postMessage({ type: 'CWI', isInvocation: false, id: invocation.id, status: 'error', ...normalized }, event.origin)
    }
    return true
  }
}

export const frameWalletBridge = new FrameWalletBridge()

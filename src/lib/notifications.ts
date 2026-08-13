import type { PeerMessage } from '@bsv/message-box-client'

export const MESSAGEBOX_HOST = 'https://messagebox.babbage.systems'
export const NOTIFICATION_BOX = 'notifications'

export type MetanetNotification = {
  id: string
  title: string
  body: string
  url?: string
  sender?: string
  receivedAt?: number
  raw: PeerMessage
}

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined

const firstText = (record: Record<string, unknown> | undefined, keys: string[]) => {
  for (const key of keys) {
    const value = record?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }
  return undefined
}

export function toMetanetNotification(message: PeerMessage): MetanetNotification {
  let value: unknown = message.body
  if (typeof value === 'string') {
    try { value = JSON.parse(value) } catch { /* Plain text notification. */ }
  }
  const outer = asRecord(value)
  const nested = asRecord(outer?.message)
  const content = nested ?? outer
  const body = firstText(content, ['body', 'message', 'text', 'description'])
    ?? (typeof value === 'string' ? value : 'Open this notification to see the latest Metanet activity.')
  const urlValue = firstText(content, ['url', 'link', 'href']) ?? firstText(outer, ['url', 'link', 'href'])
  let url: string | undefined
  try {
    const parsed = urlValue ? new URL(urlValue) : undefined
    if (parsed?.protocol === 'https:' || parsed?.hostname === 'localhost') url = parsed.toString()
  } catch { /* Invalid links are omitted. */ }
  const receivedAt = Number((message as unknown as { timestamp?: unknown }).timestamp)
  return {
    id: message.messageId,
    title: firstText(content, ['title', 'subject']) ?? firstText(outer, ['title', 'subject']) ?? 'Metanet notification',
    body,
    url,
    sender: typeof message.sender === 'string' ? message.sender : undefined,
    receivedAt: Number.isFinite(receivedAt) ? receivedAt : undefined,
    raw: message
  }
}

export class MetanetNotificationStore {
  private runtime?: Promise<{
    client: import('@bsv/message-box-client').MessageBoxClient
  }>

  private getRuntime() {
    if (!this.runtime) {
      this.runtime = Promise.all([import('@bsv/sdk'), import('@bsv/message-box-client')]).then(([sdk, messageBox]) => {
        const originator = window.location.hostname
        const wallet = new sdk.WalletClient('auto', originator)
        return {
          client: new messageBox.MessageBoxClient({
            walletClient: wallet,
            host: MESSAGEBOX_HOST,
            originator,
            networkPreset: 'mainnet',
            enableLogging: false
          })
        }
      })
    }
    return this.runtime
  }

  async list(): Promise<MetanetNotification[]> {
    const { client } = await this.getRuntime()
    const messages = await client.listMessages({
      messageBox: NOTIFICATION_BOX,
      host: MESSAGEBOX_HOST,
      acceptPayments: true
    })
    return messages.map(toMetanetNotification)
  }

  async dismiss(notification: MetanetNotification): Promise<void> {
    const { client } = await this.getRuntime()
    await client.acknowledgeNotification(notification.raw)
  }
}

export const metanetNotificationStore = new MetanetNotificationStore()

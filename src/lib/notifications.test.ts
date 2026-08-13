import type { PeerMessage } from '@bsv/message-box-client'
import { describe, expect, it } from 'vitest'

import { toMetanetNotification } from './notifications'

const message = (body: unknown) => ({ messageId: 'message-1', sender: 'alice', body }) as unknown as PeerMessage

describe('Metanet notifications', () => {
  it('normalizes structured message and payment links', () => {
    expect(toMetanetNotification(message(JSON.stringify({ title: 'Payment received', body: 'You received 500 sats', url: 'https://convo.metanet.app/payments' })))).toMatchObject({
      id: 'message-1', title: 'Payment received', body: 'You received 500 sats', url: 'https://convo.metanet.app/payments', sender: 'alice'
    })
  })

  it('keeps plain text and rejects unsafe links', () => {
    expect(toMetanetNotification(message('New Convo message'))).toMatchObject({ title: 'Metanet notification', body: 'New Convo message' })
    expect(toMetanetNotification(message({ body: 'No unsafe link', url: 'javascript:alert(1)' })).url).toBeUndefined()
  })
})

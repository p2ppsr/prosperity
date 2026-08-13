import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const manifest = JSON.parse(readFileSync('public/manifest.json', 'utf8'))

describe('BRC-116 application manifest', () => {
  it('uses the current metanet namespace without the deprecated duplicate', () => {
    expect(manifest.metanet.schemaVersion).toBe(1)
    expect(manifest.babbage).toBeUndefined()
  })

  it('groups the exact encrypted profile and Stuff LocalKVStore scopes', () => {
    expect(manifest.metanet.groupPermissions.protocolPermissions).toEqual([
      expect.objectContaining({ protocolID: [2, 'babbage os'], counterparty: 'self' }),
      expect.objectContaining({ protocolID: [2, 'filesystem'], counterparty: 'self' })
    ])
    expect(manifest.metanet.groupPermissions.basketAccess.map((item: { basket: string }) => item.basket)).toEqual(['babbage os', 'filesystem'])
  })

  it('uses the normative monthly spending shape and does not request unrelated PACT', () => {
    expect(manifest.metanet.groupPermissions.spendingAuthorization).toEqual({
      amount: 100000,
      description: expect.any(String)
    })
    expect(manifest.metanet.groupPermissions.spendingAuthorization.duration).toBeUndefined()
    expect(manifest.metanet.counterpartyPermissions).toBeUndefined()
  })
})

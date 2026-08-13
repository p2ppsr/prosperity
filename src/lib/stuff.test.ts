import { describe, expect, it } from 'vitest'

import { mimeTypeForName, nodeIdFromStuffUrl, stuffUrlForNode } from './stuff'

describe('Stuff desktop file convention', () => {
  it('maps common file names to stable MIME types', () => {
    expect(mimeTypeForName('notes.md')).toBe('text/markdown')
    expect(mimeTypeForName('data.json')).toBe('application/json')
    expect(mimeTypeForName('unknown.bin')).toBe('application/octet-stream')
  })

  it('round-trips an encrypted Stuff node identifier through a desktop URL', () => {
    const url = stuffUrlForNode('file id/with spaces')
    expect(url).toMatch(/^https?:\/\//)
    expect(nodeIdFromStuffUrl(url)).toBe('file id/with spaces')
  })

  it('ignores unrelated URLs', () => {
    expect(nodeIdFromStuffUrl('https://example.com/#other=value')).toBeUndefined()
    expect(nodeIdFromStuffUrl('not a url')).toBeUndefined()
  })
})

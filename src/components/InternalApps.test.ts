import { describe, expect, it } from 'vitest'

import { frameRestrictionReason } from './InternalApps'

describe('Babbage Browser frame compatibility', () => {
  it('hands known frame-restricted sites to a normal browser tab', () => {
    expect(frameRestrictionReason('https://www.google.com/search?q=bsv')).toContain('does not permit')
    expect(frameRestrictionReason('https://duckduckgo.com')).toContain('does not permit')
    expect(frameRestrictionReason('https://metanetapps.com/app/example')).toContain('does not permit')
  })

  it('allows frame-compatible sites to try embedded browsing', () => {
    expect(frameRestrictionReason('https://projectbabbage.com')).toBeUndefined()
  })
})

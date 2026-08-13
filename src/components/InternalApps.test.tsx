import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDefaultProfile } from '../lib/profile'
import { BrowserApp, frameRestrictionReason } from './InternalApps'

describe('Babbage Browser frame compatibility', () => {
  afterEach(cleanup)

  it('hands known frame-restricted sites to a normal browser tab', () => {
    expect(frameRestrictionReason('https://www.google.com/search?q=bsv')).toContain('does not permit')
    expect(frameRestrictionReason('https://duckduckgo.com')).toContain('does not permit')
    expect(frameRestrictionReason('https://metanetapps.com/app/example')).toContain('does not permit')
  })

  it('allows frame-compatible sites to try embedded browsing', () => {
    expect(frameRestrictionReason('https://projectbabbage.com')).toBeUndefined()
  })

  it('keeps the compatibility banner and iframe inside one bounded viewport', () => {
    render(<BrowserApp profile={createDefaultProfile()} onBrowserChange={vi.fn()} />)

    const frame = screen.getByTitle('Babbage Browser page')
    const viewport = frame.closest('.browser-viewport')
    expect(viewport).not.toBeNull()
    expect(viewport).toContainElement(screen.getByText(/If a page stays blank/))
    expect(viewport?.parentElement).toHaveClass('browser-web-view')
  })
})

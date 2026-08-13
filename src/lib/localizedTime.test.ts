import { describe, expect, it } from 'vitest'

import { formatLocalizedDifference, localizedTimeAt } from './localizedTime'

describe('Localized Sunrise–Sunset Time', () => {
  it('uses the original D/N difference notation', () => {
    expect(formatLocalizedDifference('D', 60 * 60 * 1000)).toBe('D1:00')
    expect(formatLocalizedDifference('N', -30 * 60 * 1000)).toBe('N-:30')
    expect(formatLocalizedDifference('D', 45 * 60 * 1000)).toBe('D:45')
  })

  it('selects day and night references from local solar events', () => {
    const latitude = 40.7128
    const longitude = -74.006
    const day = localizedTimeAt(new Date('2026-06-21T16:00:00Z'), latitude, longitude)
    const night = localizedTimeAt(new Date('2026-06-22T04:00:00Z'), latitude, longitude)

    expect(day.phase).toBe('day')
    expect(day.primary).toMatch(/^D/)
    expect(day.secondary).toMatch(/^N-/)
    expect(night.phase).toBe('night')
    expect(night.primary).toMatch(/^N/)
    expect(night.secondary).toMatch(/^D-/)
  })
})

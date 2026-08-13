import { describe, expect, it } from 'vitest'

import { createDefaultProfile } from './profile'
import { nudgeDesktopItem, positionDesktopItem, reorderMobileItem } from './layout'

describe('independent desktop and mobile layouts', () => {
  it('moves a desktop icon without changing mobile order', () => {
    const profile = createDefaultProfile()
    const next = positionDesktopItem(profile, 'desktop-stuff', 520, 260, {
      left: 0,
      top: 0,
      width: 1200,
      height: 800
    })

    expect(next.desktopItems.find((item) => item.id === 'desktop-stuff')).toMatchObject({ x: 482, y: 228 })
    expect(next.mobileItems).toBe(profile.mobileItems)
  })

  it('reorders a mobile icon without changing desktop positions', () => {
    const profile = createDefaultProfile()
    const before = [...profile.mobileItems].sort((a, b) => a.order - b.order)
    const next = reorderMobileItem(profile, before[1].id, -1)
    const after = [...next.mobileItems].sort((a, b) => a.order - b.order)

    expect(after[0].id).toBe(before[1].id)
    expect(after[1].id).toBe(before[0].id)
    expect(after.map((item) => item.order)).toEqual(after.map((_, index) => index))
    expect(next.desktopItems).toBe(profile.desktopItems)
  })

  it('supports bounded keyboard movement without changing mobile order', () => {
    const profile = createDefaultProfile()
    const next = nudgeDesktopItem(profile, 'desktop-stuff', 16, 16, { width: 1200, height: 800 })

    expect(next.desktopItems.find((item) => item.id === 'desktop-stuff')).toMatchObject({ x: 40, y: 44 })
    expect(next.mobileItems).toBe(profile.mobileItems)
  })

  it('does not mutate layout at a reorder boundary', () => {
    const profile = createDefaultProfile()
    const first = [...profile.mobileItems].sort((a, b) => a.order - b.order)[0]
    expect(reorderMobileItem(profile, first.id, -1)).toBe(profile)
  })
})

import { describe, expect, it } from 'vitest'

import type { WindowState } from '../types/manifest'
import { resizeSnappedWindow, snapWindowState, toggleMaximizedWindow } from './windows'

const floating: WindowState = {
  id: 'window', appId: 'browser', title: 'Browser', x: 100, y: 80,
  width: 800, height: 600, minimized: false, maximized: false, zIndex: 1
}

describe('window management', () => {
  it('snaps two windows into non-overlapping halves and restores the original bounds', () => {
    const viewport = { width: 1440, height: 900 }
    const left = snapWindowState(floating, 'left', viewport)
    const right = snapWindowState(floating, 'right', viewport)
    expect(left).toMatchObject({ x: 8, y: 8, width: 708, height: 828, snap: 'left' })
    expect(right.x).toBe(724)
    expect(right.x).toBeGreaterThanOrEqual(left.x + left.width)
    expect(snapWindowState(left, 'left', viewport)).toMatchObject(floating)
  })

  it('keeps snapped and maximized windows fitted after a viewport resize', () => {
    const snapped = snapWindowState(floating, 'right', { width: 1440, height: 900 })
    expect(resizeSnappedWindow(snapped, { width: 1024, height: 700 })).toMatchObject({ x: 516, y: 8, width: 500, height: 628, snap: 'right' })
    const maximized = toggleMaximizedWindow(floating, { width: 1440, height: 900 })
    expect(resizeSnappedWindow(maximized, { width: 1024, height: 700 })).toMatchObject({ x: 8, y: 8, width: 1008, height: 628, maximized: true })
  })
})

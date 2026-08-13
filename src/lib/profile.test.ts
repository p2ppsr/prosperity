import { describe, expect, it } from 'vitest'

import { DEFAULT_APPS } from '../data/apps'
import { createDefaultProfile, normalizeProfile, removeInstalledApp } from './profile'

describe('wallet profile normalization', () => {
  it('rejects unknown profile schemas', () => {
    expect(normalizeProfile(null)).toBeUndefined()
    expect(normalizeProfile({ schema: 'other', schemaVersion: '1.0' })).toBeUndefined()
  })

  it('keeps saved layout while upgrading built-in app definitions', () => {
    const saved = createDefaultProfile()
    saved.desktopItems[0] = { ...saved.desktopItems[0], x: 512, y: 256 }
    saved.installedApps = saved.installedApps.map((app) => app.id === 'stuff'
      ? { ...app, description: 'stale Stuff', launch: { kind: 'iframe', url: 'https://stale.example' } }
      : app)

    const normalized = normalizeProfile(saved)!

    expect(normalized.desktopItems[0]).toMatchObject({ x: 512, y: 256 })
    expect(normalized.installedApps.find((app) => app.id === 'stuff')).toEqual(DEFAULT_APPS.find((app) => app.id === 'stuff'))
  })

  it('preserves custom apps and adds newly shipped defaults', () => {
    const saved = createDefaultProfile()
    const custom = { ...saved.installedApps[0], id: 'custom-example', name: 'Example' }
    saved.installedApps = [custom]
    saved.mobileItems = []

    const normalized = normalizeProfile(saved)!

    expect(normalized.installedApps.map((app) => app.id)).toEqual(expect.arrayContaining([...DEFAULT_APPS.map((app) => app.id), 'custom-example']))
    expect(normalized.mobileItems).toHaveLength(createDefaultProfile().mobileItems.length)
  })

  it('repairs an invalid timezone and missing nested collections', () => {
    const normalized = normalizeProfile({
      schema: 'babbage-os-profile', schemaVersion: '1.0', settings: { timezone: 'Mars/Olympus' }, browser: null
    })!
    expect(() => new Intl.DateTimeFormat(undefined, { timeZone: normalized.settings.timezone })).not.toThrow()
    expect(normalized.browser).toEqual({ bookmarks: [], history: [], credentials: [] })
  })

  it('removes a custom app and both layout entries while protecting built-ins', () => {
    const profile = createDefaultProfile()
    const custom = { ...profile.installedApps[1], id: 'custom-example', name: 'Example' }
    profile.installedApps.push(custom)
    profile.desktopItems.push({ id: 'desktop-custom-example', kind: 'app', targetId: custom.id, x: 200, y: 100 })
    profile.mobileItems.push({ id: 'mobile-custom-example', kind: 'app', targetId: custom.id, order: profile.mobileItems.length })

    const next = removeInstalledApp(profile, custom.id)

    expect(next.installedApps.some((app) => app.id === custom.id)).toBe(false)
    expect(next.desktopItems.some((item) => item.targetId === custom.id)).toBe(false)
    expect(next.mobileItems.some((item) => item.targetId === custom.id)).toBe(false)
    expect(next.mobileItems.map((item) => item.order)).toEqual(next.mobileItems.map((_, index) => index))
    expect(removeInstalledApp(next, 'stuff')).toBe(next)
  })
})

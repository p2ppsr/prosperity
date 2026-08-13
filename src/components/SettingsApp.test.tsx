import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_APPS } from '../data/apps'
import { createDefaultProfile } from '../lib/profile'
import { SettingsApp } from './InternalApps'

describe('System Settings', () => {
  afterEach(cleanup)

  it('selects and persists a custom wallpaper atomically', () => {
    const profile = createDefaultProfile()
    const onChange = vi.fn()
    render(<SettingsApp settings={profile.settings} mobileItems={profile.mobileItems} installedApps={DEFAULT_APPS} onChange={onChange} onMoveMobile={vi.fn()} onRemoveApp={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Custom wallpaper URL'), { target: { value: 'https://example.com/wallpaper.png' } })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      customWallpaperUrl: 'https://example.com/wallpaper.png',
      wallpaper: 'custom'
    }))
  })

  it('returns to the default wallpaper when the custom URL is cleared', () => {
    const profile = createDefaultProfile()
    profile.settings = { ...profile.settings, wallpaper: 'custom', customWallpaperUrl: 'https://example.com/wallpaper.png' }
    const onChange = vi.fn()
    render(<SettingsApp settings={profile.settings} mobileItems={profile.mobileItems} installedApps={DEFAULT_APPS} onChange={onChange} onMoveMobile={vi.fn()} onRemoveApp={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Custom wallpaper URL'), { target: { value: '' } })

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ customWallpaperUrl: '', wallpaper: 'babbage-dawn' }))
  })

  it('removes custom apps while keeping built-in apps protected', () => {
    const profile = createDefaultProfile()
    const customApp = {
      ...DEFAULT_APPS[1],
      id: 'custom-proof-app',
      name: 'Proof App',
      shortName: 'Proof App',
      launch: { kind: 'iframe' as const, url: 'https://example.com/' }
    }
    const onRemoveApp = vi.fn()
    render(<SettingsApp settings={profile.settings} mobileItems={profile.mobileItems} installedApps={[...DEFAULT_APPS, customApp]} onChange={vi.fn()} onMoveMobile={vi.fn()} onRemoveApp={onRemoveApp} />)

    expect(screen.queryByRole('button', { name: 'Remove Stuff' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove Proof App' }))
    expect(onRemoveApp).toHaveBeenCalledWith('custom-proof-app')
  })
})

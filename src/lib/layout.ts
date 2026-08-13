import type { PersistedProfileV1 } from '../types/manifest'

type DesktopBounds = {
  left: number
  top: number
  width: number
  height: number
}

export function positionDesktopItem(
  profile: PersistedProfileV1,
  id: string,
  clientX: number,
  clientY: number,
  bounds: DesktopBounds
): PersistedProfileV1 {
  return {
    ...profile,
    desktopItems: profile.desktopItems.map((item) => item.id === id ? {
      ...item,
      x: Math.max(8, Math.min(bounds.width - 88, clientX - bounds.left - 38)),
      y: Math.max(8, Math.min(bounds.height - 92, clientY - bounds.top - 32))
    } : item)
  }
}

export function nudgeDesktopItem(
  profile: PersistedProfileV1,
  id: string,
  deltaX: number,
  deltaY: number,
  bounds: Pick<DesktopBounds, 'width' | 'height'>
): PersistedProfileV1 {
  const current = profile.desktopItems.find((item) => item.id === id)
  if (!current) return profile
  return {
    ...profile,
    desktopItems: profile.desktopItems.map((item) => item.id === id ? {
      ...item,
      x: Math.max(8, Math.min(bounds.width - 88, item.x + deltaX)),
      y: Math.max(8, Math.min(bounds.height - 92, item.y + deltaY))
    } : item)
  }
}

export function reorderMobileItem(
  profile: PersistedProfileV1,
  id: string,
  direction: -1 | 1
): PersistedProfileV1 {
  const sorted = [...profile.mobileItems].sort((a, b) => a.order - b.order)
  const index = sorted.findIndex((item) => item.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= sorted.length) return profile
  ;[sorted[index], sorted[target]] = [sorted[target], sorted[index]]
  return { ...profile, mobileItems: sorted.map((item, order) => ({ ...item, order })) }
}

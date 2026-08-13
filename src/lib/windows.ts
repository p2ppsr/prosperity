import type { WindowBounds, WindowState } from '../types/manifest'

export type WindowViewport = { width: number; height: number }
export type WindowSnap = 'left' | 'right'

const floatingBounds = (state: WindowState): WindowBounds => ({
  x: state.x, y: state.y, width: state.width, height: state.height
})

export function snapWindowState(state: WindowState, side: WindowSnap, viewport: WindowViewport): WindowState {
  if (state.snap === side && state.restoreBounds) {
    return { ...state, ...state.restoreBounds, restoreBounds: undefined, maximized: false, snap: undefined }
  }
  const gap = 8
  const usableWidth = Math.max(320, viewport.width - gap * 3)
  const width = Math.floor(usableWidth / 2)
  const restoreBounds = state.restoreBounds ?? floatingBounds(state)
  return {
    ...state,
    x: side === 'left' ? gap : viewport.width - width - gap,
    y: gap,
    width,
    height: Math.max(320, viewport.height - 72),
    restoreBounds,
    maximized: false,
    snap: side
  }
}

export function toggleMaximizedWindow(state: WindowState, viewport: WindowViewport): WindowState {
  if (state.maximized && state.restoreBounds) {
    return { ...state, ...state.restoreBounds, restoreBounds: undefined, maximized: false, snap: undefined }
  }
  return {
    ...state,
    x: 8,
    y: 8,
    width: Math.max(320, viewport.width - 16),
    height: Math.max(320, viewport.height - 72),
    restoreBounds: state.restoreBounds ?? floatingBounds(state),
    maximized: true,
    snap: undefined
  }
}

export function resizeSnappedWindow(state: WindowState, viewport: WindowViewport): WindowState {
  if (state.maximized) return { ...state, x: 8, y: 8, width: viewport.width - 16, height: viewport.height - 72 }
  return state.snap ? snapWindowState({ ...state, snap: undefined }, state.snap, viewport) : state
}

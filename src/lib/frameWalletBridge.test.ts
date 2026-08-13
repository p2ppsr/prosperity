import { describe, expect, it, vi } from 'vitest'

import { EMBEDDED_APP_PERMISSIONS, FrameWalletBridge } from './frameWalletBridge'

const invocation = (overrides: Record<string, unknown> = {}) => ({
  type: 'CWI', isInvocation: true, id: 'request-1', call: 'getVersion', args: {}, ...overrides
})

describe('embedded app wallet bridge', () => {
  it('delegates current and backwards-compatible local wallet permissions', () => {
    expect(EMBEDDED_APP_PERMISSIONS).toContain('local-network-access')
    expect(EMBEDDED_APP_PERMISSIONS).toContain('local-network')
    expect(EMBEDDED_APP_PERMISSIONS).toContain('loopback-network')
  })

  it('relays a registered frame request with the app hostname as originator', async () => {
    const postMessage = vi.fn()
    const source = { postMessage }
    const factory = vi.fn(async () => ({ getVersion: vi.fn(async () => ({ version: '2.4.0' })) }))
    const bridge = new FrameWalletBridge(factory as never)
    bridge.registerSource(source, 'https://convo.metanet.app/inbox')

    await bridge.handleMessage({ source, origin: 'https://convo.metanet.app', data: invocation() } as unknown as MessageEvent)

    expect(factory).toHaveBeenCalledWith('convo.metanet.app')
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'CWI', isInvocation: false, id: 'request-1', status: 'success', result: { version: '2.4.0' }
    }), 'https://convo.metanet.app')
  })

  it('rejects an origin mismatch without touching the wallet', async () => {
    const source = { postMessage: vi.fn() }
    const factory = vi.fn(async () => ({}))
    const bridge = new FrameWalletBridge(factory as never)
    bridge.registerSource(source, 'https://convo.metanet.app')

    expect(await bridge.handleMessage({ source, origin: 'https://evil.example', data: invocation() } as unknown as MessageEvent)).toBe(false)
    expect(factory).toHaveBeenCalledTimes(1)
    expect(source.postMessage).not.toHaveBeenCalled()
  })

  it('rejects unregistered sources and non-wallet calls', async () => {
    const registered = { postMessage: vi.fn() }
    const stranger = { postMessage: vi.fn() }
    const factory = vi.fn(async () => ({}))
    const bridge = new FrameWalletBridge(factory as never)
    bridge.registerSource(registered, 'https://docs.metanet.app')

    expect(await bridge.handleMessage({ source: stranger, origin: 'https://docs.metanet.app', data: invocation() } as unknown as MessageEvent)).toBe(false)
    expect(await bridge.handleMessage({ source: registered, origin: 'https://docs.metanet.app', data: invocation({ call: 'readPrivateKeys' }) } as unknown as MessageEvent)).toBe(false)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('returns a bounded CWI error to the requesting origin', async () => {
    const source = { postMessage: vi.fn() }
    const bridge = new FrameWalletBridge(async () => { throw Object.assign(new Error('Denied'), { code: 7 }) })
    bridge.registerSource(source, 'https://tempomusic.net')

    await bridge.handleMessage({ source, origin: 'https://tempomusic.net', data: invocation() } as unknown as MessageEvent)

    expect(source.postMessage).toHaveBeenCalledWith(expect.objectContaining({ status: 'error', description: 'Denied', code: 7 }), 'https://tempomusic.net')
  })

  it('allows HTTPS and localhost frames but rejects insecure remote frames', () => {
    const bridge = new FrameWalletBridge()
    expect(() => bridge.registerSource({ postMessage: vi.fn() }, 'https://example.com/app')).not.toThrow()
    expect(() => bridge.registerSource({ postMessage: vi.fn() }, 'http://localhost:3000')).not.toThrow()
    expect(() => bridge.registerSource({ postMessage: vi.fn() }, 'http://example.com')).toThrow(/HTTPS or localhost/)
  })
})

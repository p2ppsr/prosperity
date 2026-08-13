import { describe, expect, it } from 'vitest'
import { DEFAULT_APPS } from '../data/apps'
import { resolveFileApp } from './fileAssociations'

describe('resolveFileApp', () => {
  it('opens text documents with Metanet Docs', () => {
    expect(resolveFileApp({
      schema: 'babbage-os-desktop-file', schemaVersion: '1.0', id: '1', name: 'notes.md',
      stuffUrl: 'https://example.test/notes', mimeType: 'text/markdown', extension: 'md', createdAt: new Date(0).toISOString()
    }, DEFAULT_APPS)?.id).toBe('metanet-docs')
  })

  it('falls back to Stuff for unknown files', () => {
    expect(resolveFileApp({
      schema: 'babbage-os-desktop-file', schemaVersion: '1.0', id: '2', name: 'archive.xyz',
      stuffUrl: 'https://example.test/archive', mimeType: 'application/x-unknown', extension: 'xyz', createdAt: new Date(0).toISOString()
    }, DEFAULT_APPS)?.id).toBe('stuff')
  })
})

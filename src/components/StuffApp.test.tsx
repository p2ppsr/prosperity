import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createDefaultProfile } from '../lib/profile'
import { stuffFilesystemStore } from '../lib/stuff'
import { StuffApp } from './InternalApps'

describe('Stuff filesystem explorer', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('lets a walletless visitor explore and asks for a wallet only on save', async () => {
    vi.spyOn(stuffFilesystemStore, 'isConnected').mockResolvedValue(false)
    vi.spyOn(window, 'prompt').mockReturnValue('hello.txt')
    const onProfileChange = vi.fn()
    render(<StuffApp profile={createDefaultProfile()} onProfileChange={onProfileChange} />)

    await screen.findByText('This folder is empty.')
    expect(screen.queryByText('Connect to save in Stuff')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /new file/i }))

    expect(await screen.findByText('Connect to save in Stuff')).toBeInTheDocument()
    expect(onProfileChange).not.toHaveBeenCalled()
  })

  it('creates an encrypted file and adds its portable shortcut to the desktop', async () => {
    vi.spyOn(stuffFilesystemStore, 'isConnected').mockResolvedValue(true)
    vi.spyOn(stuffFilesystemStore, 'get').mockImplementation(async (id) => id === '/'
      ? { type: 'folder', nodes: [] }
      : { type: 'file', contents: '# Manual', mimeType: 'text/markdown' })
    vi.spyOn(stuffFilesystemStore, 'set').mockResolvedValue(undefined)
    vi.spyOn(window, 'prompt').mockReturnValue('manual.md')
    const onProfileChange = vi.fn()
    render(<StuffApp profile={createDefaultProfile()} onProfileChange={onProfileChange} />)

    await screen.findByText('This folder is empty.')
    fireEvent.click(screen.getByRole('button', { name: /new file/i }))
    await screen.findByText('manual.md created.')
    fireEvent.click(screen.getByRole('button', { name: /^manual\.md/ }))
    await screen.findByRole('textbox', { name: 'File contents' })
    fireEvent.click(screen.getByRole('button', { name: /add to desktop/i }))
    await waitFor(() => expect(onProfileChange).toHaveBeenCalledWith(
      expect.objectContaining({
        desktopFiles: [expect.objectContaining({ name: 'manual.md', mimeType: 'text/markdown' })],
        desktopItems: expect.arrayContaining([expect.objectContaining({ kind: 'file' })])
      }),
      'Stuff file shortcut'
    ))
  })

  it('removes an existing desktop shortcut without deleting the Stuff file', async () => {
    vi.spyOn(stuffFilesystemStore, 'isConnected').mockResolvedValue(true)
    vi.spyOn(stuffFilesystemStore, 'get').mockResolvedValue({ type: 'file', contents: '# Manual', mimeType: 'text/markdown' })
    const profile = createDefaultProfile()
    profile.desktopFiles = [{
      schema: 'babbage-os-desktop-file', schemaVersion: '1.0', id: 'manual-id', name: 'manual.md',
      stuffUrl: 'stuff://manual-id', mimeType: 'text/markdown', extension: 'md', preferredAppId: 'stuff', createdAt: new Date().toISOString()
    }]
    profile.desktopItems = [{ id: 'desktop-file-manual-id', kind: 'file', targetId: 'manual-id', x: 448, y: 28 }]
    const onProfileChange = vi.fn()

    render(<StuffApp profile={profile} initialResourceUrl="https://babbageos.com/#stuff=manual-id" onProfileChange={onProfileChange} />)

    fireEvent.click(await screen.findByRole('button', { name: /remove from desktop/i }))
    expect(onProfileChange).toHaveBeenCalledWith(
      expect.objectContaining({ desktopFiles: [], desktopItems: [] }),
      'Remove Stuff file shortcut'
    )
    expect(await screen.findByText(/file remains safely in Stuff/i)).toBeInTheDocument()
  })
})

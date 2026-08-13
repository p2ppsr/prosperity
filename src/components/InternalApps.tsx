import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, CircleHelp, ExternalLink, Eye, EyeOff, FileText, Folder, FolderPlus, MessageCircle, Pencil, Plus, Save, Search, ShieldCheck, Star, Trash2, WalletCards } from 'lucide-react'

import { HELP_ARTICLES } from '../data/help'
import { EMBEDDED_APP_PERMISSIONS, frameWalletBridge } from '../lib/frameWalletBridge'
import { submitFeedback } from '../lib/usercom'
import { mimeTypeForName, nodeIdFromStuffUrl, stuffFilesystemStore, stuffUrlForNode, type StuffFolder, type StuffFolderEntry, type StuffNode } from '../lib/stuff'
import type { BabbageAppManifestV1, BrowserBookmark, BrowserCredential, BrowserHistoryEntry, MobileItem, PersistedProfileV1, SystemSettings } from '../types/manifest'

const normalizeUrl = (value: string) => {
  const trimmed = value.trim()
  const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error('Only secure HTTPS pages can open in Babbage Browser.')
  return url.toString()
}

type BrowserProps = {
  profile: PersistedProfileV1
  onBrowserChange: (browser: PersistedProfileV1['browser']) => void
}

export function BrowserApp({ profile, onBrowserChange }: BrowserProps) {
  const [address, setAddress] = useState('https://projectbabbage.com')
  const [url, setUrl] = useState(address)
  const [tab, setTab] = useState<'web' | 'bookmarks' | 'history' | 'vault'>('web')
  const [error, setError] = useState('')
  const [credential, setCredential] = useState({ origin: '', username: '', password: '' })
  const [showPasswords, setShowPasswords] = useState(false)

  const navigate = (event?: FormEvent) => {
    event?.preventDefault()
    try {
      const next = normalizeUrl(address)
      setUrl(next)
      setAddress(next)
      setError('')
      const entry: BrowserHistoryEntry = { id: crypto.randomUUID(), title: new URL(next).hostname, url: next, visitedAt: new Date().toISOString() }
      onBrowserChange({ ...profile.browser, history: [entry, ...profile.browser.history].slice(0, 250) })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'That address is not valid.')
    }
  }

  const addBookmark = () => {
    const bookmark: BrowserBookmark = { id: crypto.randomUUID(), title: new URL(url).hostname, url }
    onBrowserChange({ ...profile.browser, bookmarks: [...profile.browser.bookmarks, bookmark] })
  }

  const saveCredential = (event: FormEvent) => {
    event.preventDefault()
    const next: BrowserCredential = { id: crypto.randomUUID(), ...credential, origin: normalizeUrl(credential.origin) }
    onBrowserChange({ ...profile.browser, credentials: [...profile.browser.credentials, next] })
    setCredential({ origin: '', username: '', password: '' })
  }

  return <div className="browser-app">
    <div className="browser-tabs" role="tablist">
      {(['web', 'bookmarks', 'history', 'vault'] as const).map((item) => <button className={tab === item ? 'active' : ''} key={item} onClick={() => setTab(item)}>{item}</button>)}
    </div>
    {tab === 'web' && <>
      <form className="browser-address" onSubmit={navigate}>
        <input aria-label="Web address" value={address} onChange={(event) => setAddress(event.target.value)} />
        <button type="submit">Go</button>
        <button aria-label="Bookmark page" type="button" onClick={addBookmark}><Star size={18} /></button>
        <a aria-label="Open externally" href={url} target="_blank" rel="noreferrer"><ExternalLink size={18} /></a>
      </form>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <BrowserFrame src={url} />
    </>}
    {tab === 'bookmarks' && <BrowserList empty="No bookmarks yet." items={profile.browser.bookmarks} onOpen={(next) => { setAddress(next); setUrl(next); setTab('web') }} onDelete={(id) => onBrowserChange({ ...profile.browser, bookmarks: profile.browser.bookmarks.filter((item) => item.id !== id) })} />}
    {tab === 'history' && <BrowserList empty="Your encrypted history is empty." items={profile.browser.history} onOpen={(next) => { setAddress(next); setUrl(next); setTab('web') }} onDelete={(id) => onBrowserChange({ ...profile.browser, history: profile.browser.history.filter((item) => item.id !== id) })} />}
    {tab === 'vault' && <div className="vault-panel">
      <div className="section-heading"><div><span className="eyebrow">Encrypted Local KV Store</span><h2>Credential vault</h2></div><button className="icon-action" onClick={() => setShowPasswords((value) => !value)}>{showPasswords ? <EyeOff /> : <Eye />}</button></div>
      <p>Credentials stay inside your wallet-encrypted Babbage OS profile and are never injected into framed sites.</p>
      <form className="stack-form" onSubmit={saveCredential}>
        <label>Website<input required placeholder="https://example.com" value={credential.origin} onChange={(event) => setCredential({ ...credential, origin: event.target.value })} /></label>
        <label>Username<input required autoComplete="off" value={credential.username} onChange={(event) => setCredential({ ...credential, username: event.target.value })} /></label>
        <label>Password<input required autoComplete="new-password" type="password" value={credential.password} onChange={(event) => setCredential({ ...credential, password: event.target.value })} /></label>
        <button className="primary-button">Save encrypted credential</button>
      </form>
      <div className="credential-list">{profile.browser.credentials.map((item) => <article key={item.id}><ShieldCheck /><div><strong>{new URL(item.origin).hostname}</strong><span>{item.username}</span><code>{showPasswords ? item.password : '••••••••••••'}</code></div><button aria-label={`Delete credentials for ${item.origin}`} onClick={() => onBrowserChange({ ...profile.browser, credentials: profile.browser.credentials.filter((candidate) => candidate.id !== item.id) })}><Trash2 /></button></article>)}</div>
    </div>}
  </div>
}

function BrowserFrame({ src }: { src: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (!frameRef.current) return
    return frameWalletBridge.registerFrame(frameRef.current, src)
  }, [src])
  return <iframe ref={frameRef} className="browser-frame" title="Babbage Browser page" src={src} sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads" allow={EMBEDDED_APP_PERMISSIONS} />
}

function BrowserList({ items, empty, onOpen, onDelete }: { items: Array<BrowserBookmark | BrowserHistoryEntry>; empty: string; onOpen: (url: string) => void; onDelete: (id: string) => void }) {
  if (!items.length) return <div className="empty-state"><GlobeEmpty /><h2>{empty}</h2></div>
  return <div className="browser-list">{items.map((item) => <article key={item.id}><button className="browser-list__main" onClick={() => onOpen(item.url)}><strong>{item.title}</strong><span>{item.url}</span>{'visitedAt' in item && <small>{new Date(item.visitedAt).toLocaleString()}</small>}</button><button aria-label={`Delete ${item.title}`} onClick={() => onDelete(item.id)}><Trash2 size={18} /></button></article>)}</div>
}

function GlobeEmpty() { return <div className="empty-orbit"><span /></div> }

export function SettingsApp({ settings, mobileItems, installedApps, onChange, onMoveMobile }: {
  settings: SystemSettings
  mobileItems: MobileItem[]
  installedApps: BabbageAppManifestV1[]
  onChange: (settings: SystemSettings) => void
  onMoveMobile: (id: string, direction: -1 | 1) => void
}) {
  const update = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => onChange({ ...settings, [key]: value })
  const timezones = useMemo(() => {
    try { return Intl.supportedValuesOf('timeZone') } catch { return ['UTC', 'America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] }
  }, [])
  return <div className="settings-app">
    <div className="settings-hero"><span className="eyebrow">Personal computing, made yours</span><h2>System Settings</h2><p>Changes preview immediately and save into your encrypted wallet profile.</p></div>
    <section><h3>Appearance</h3><div className="segmented">{(['system', 'light', 'dark'] as const).map((theme) => <button className={settings.theme === theme ? 'active' : ''} onClick={() => update('theme', theme)} key={theme}>{theme}</button>)}</div>
      <div className="wallpaper-grid">{(['babbage-dawn', 'babbage-midnight'] as const).map((wallpaper) => <button className={settings.wallpaper === wallpaper ? 'active' : ''} key={wallpaper} onClick={() => update('wallpaper', wallpaper)}><span style={{ backgroundImage: `url(/wallpapers/${wallpaper}.png)` }} /><strong>{wallpaper === 'babbage-dawn' ? 'Babbage Dawn' : 'Babbage Midnight'}</strong></button>)}</div>
      <label>Custom wallpaper URL<input placeholder="https://…" value={settings.customWallpaperUrl} onChange={(event) => { update('customWallpaperUrl', event.target.value); if (event.target.value) update('wallpaper', 'custom') }} /></label>
      <label>Accent<select value={settings.accent} onChange={(event) => update('accent', event.target.value as SystemSettings['accent'])}><option value="cyan">Cyan</option><option value="violet">Violet</option><option value="coral">Coral</option><option value="green">Green</option></select></label>
    </section>
    <section><h3>Time & motion</h3><label>Timezone<select value={settings.timezone} onChange={(event) => update('timezone', event.target.value)}>{timezones.map((timezone) => <option key={timezone}>{timezone}</option>)}</select></label>
      <label className="toggle"><input type="checkbox" checked={settings.clock24Hour} onChange={(event) => update('clock24Hour', event.target.checked)} /><span />24-hour clock</label>
      <label className="toggle"><input type="checkbox" checked={settings.showSeconds} onChange={(event) => update('showSeconds', event.target.checked)} /><span />Show seconds</label>
      <label className="toggle"><input type="checkbox" checked={settings.reduceMotion} onChange={(event) => update('reduceMotion', event.target.checked)} /><span />Reduce motion</label>
    </section>
    <section><h3>Mobile home layout</h3><p>Arrange the phone home screen without moving desktop icons.</p><div className="mobile-layout-settings">{[...mobileItems].sort((a, b) => a.order - b.order).map((item, index, ordered) => { const app = installedApps.find((candidate) => candidate.id === item.targetId); if (!app) return null; return <article key={item.id}><span><strong>{app.name}</strong><small>Position {index + 1}</small></span><span><button aria-label={`Move ${app.name} earlier on mobile`} disabled={index === 0} onClick={() => onMoveMobile(item.id, -1)}>Earlier</button><button aria-label={`Move ${app.name} later on mobile`} disabled={index === ordered.length - 1} onClick={() => onMoveMobile(item.id, 1)}>Later</button></span></article> })}</div></section>
  </div>
}

export function HelpCenter() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(HELP_ARTICLES[0].id)
  const results = HELP_ARTICLES.filter((article) => `${article.title} ${article.section} ${article.body.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  const article = HELP_ARTICLES.find((candidate) => candidate.id === selected) ?? results[0] ?? HELP_ARTICLES[0]
  return <div className="help-app">
    <aside><div className="help-brand"><CircleHelp /><div><strong>Help Center</strong><span>Complete user manual</span></div></div><label className="help-search"><Search size={18} /><input aria-label="Search help" placeholder="Search instructions…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><nav>{results.map((item) => <button className={item.id === article.id ? 'active' : ''} onClick={() => setSelected(item.id)} key={item.id}><small>{item.section}</small>{item.title}</button>)}</nav></aside>
    <article><span className="eyebrow">{article.section}</span><h1>{article.title}</h1>{article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="help-callout"><strong>Still need help?</strong><span>Use Feedback in the system tray and tell us what happened.</span></div></article>
  </div>
}

export function FeedbackApp() {
  const [form, setForm] = useState({ category: 'idea', email: '', message: '' })
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setStatus('')
    try { await submitFeedback(form); setStatus('Thanks—your feedback is on its way.'); setForm({ ...form, message: '' }) }
    catch (reason) { setStatus(reason instanceof Error ? reason.message : 'Feedback could not be sent.') }
    finally { setBusy(false) }
  }
  return <div className="feedback-app"><span className="feedback-signal"><MessageCircleIcon /></span><span className="eyebrow">Help shape the system</span><h2>Tell us what you think</h2><p>Send a bug, idea, question, or compliment. No wallet identity, browsing data, files, or credentials are attached.</p><form className="stack-form" onSubmit={send}><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="idea">Idea</option><option value="bug">Bug</option><option value="question">Question</option><option value="compliment">Compliment</option></select></label><label>Email (optional)<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Your feedback<textarea required minLength={3} maxLength={5000} rows={7} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label><button className="primary-button" disabled={busy}>{busy ? 'Sending…' : 'Send feedback'}</button>{status && <p role="status" className="form-status">{status}</p>}</form></div>
}

function MessageCircleIcon() { return <MessageCircle size={32} /> }

export function StuffApp({ profile, initialResourceUrl, onProfileChange }: {
  profile: PersistedProfileV1
  initialResourceUrl?: string
  onProfileChange: (profile: PersistedProfileV1, reason: string) => void
}) {
  const initialNodeId = nodeIdFromStuffUrl(initialResourceUrl)
  const [path, setPath] = useState<Array<{ id: string; name: string }>>([{ id: '/', name: 'Stuff' }])
  const [node, setNode] = useState<StuffNode>({ type: 'folder', nodes: [] })
  const [currentId, setCurrentId] = useState(initialNodeId ?? '/')
  const [currentName, setCurrentName] = useState(initialNodeId ? 'File' : 'Stuff')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [needsWallet, setNeedsWallet] = useState(false)

  const load = async (id: string, name: string, nextPath?: Array<{ id: string; name: string }>) => {
    setLoading(true); setStatus('')
    try {
      const connected = await stuffFilesystemStore.isConnected()
      if (!connected) {
        setNode({ type: 'folder', nodes: [] }); setNeedsWallet(false)
        if (id !== '/') setStatus('Connect your wallet to open this encrypted Stuff file.')
      } else {
        const found = await stuffFilesystemStore.get(id)
        setNode(found ?? { type: 'folder', nodes: [] })
      }
      setCurrentId(id); setCurrentName(name)
      if (nextPath) setPath(nextPath)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Stuff could not open this item.')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load(initialNodeId ?? '/', initialNodeId ? 'Desktop file' : 'Stuff') }, [initialNodeId])

  const withWallet = async (operation: () => Promise<void>) => {
    setBusy(true); setStatus('')
    try {
      if (!await stuffFilesystemStore.isConnected()) {
        setNeedsWallet(true)
        return
      }
      await operation()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Stuff could not save that change.')
    } finally { setBusy(false) }
  }

  const connect = async () => {
    setBusy(true); setStatus('Waiting for your wallet…')
    try {
      await stuffFilesystemStore.connect()
      setNeedsWallet(false)
      await load(currentId, currentName)
      setStatus('Wallet connected. Stuff is ready.')
    } catch { setStatus('No wallet responded. Install or unlock Babbage Go, then retry.') }
    finally { setBusy(false) }
  }

  const createEntry = (type: StuffFolderEntry['type']) => {
    if (node.type !== 'folder') return
    const name = window.prompt(type === 'folder' ? 'Folder name' : 'File name')?.trim()
    if (!name) return
    if (name.includes('/')) { setStatus('Names cannot contain “/”.'); return }
    void withWallet(async () => {
      const entry: StuffFolderEntry = { id: crypto.randomUUID(), name, type, mimeType: type === 'file' ? mimeTypeForName(name) : undefined }
      const next: StuffFolder = { ...node, nodes: [...node.nodes, entry] }
      await stuffFilesystemStore.set(entry.id, type === 'folder' ? { type: 'folder', nodes: [] } : { type: 'file', contents: '', mimeType: entry.mimeType ?? 'text/plain' })
      await stuffFilesystemStore.set(currentId, next)
      setNode(next); setStatus(`${name} created.`)
    })
  }

  const renameEntry = (entry: StuffFolderEntry) => {
    if (node.type !== 'folder') return
    const name = window.prompt(`Rename ${entry.name}`, entry.name)?.trim()
    if (!name || name === entry.name) return
    if (name.includes('/')) { setStatus('Names cannot contain “/”.'); return }
    void withWallet(async () => {
      const next = { ...node, nodes: node.nodes.map((item) => item.id === entry.id ? { ...item, name, mimeType: item.type === 'file' ? mimeTypeForName(name) : undefined } : item) }
      await stuffFilesystemStore.set(currentId, next); setNode(next); setStatus(`Renamed to ${name}.`)
    })
  }

  const deleteEntry = (entry: StuffFolderEntry) => {
    if (node.type !== 'folder' || !window.confirm(`Delete ${entry.name}?`)) return
    void withWallet(async () => {
      const next = { ...node, nodes: node.nodes.filter((item) => item.id !== entry.id) }
      await stuffFilesystemStore.set(currentId, next)
      await stuffFilesystemStore.remove(entry.id)
      setNode(next); setStatus(`${entry.name} deleted.`)
    })
  }

  const openEntry = (entry: StuffFolderEntry) => {
    void load(entry.id, entry.name, [...path, { id: entry.id, name: entry.name }])
  }

  const goBack = () => {
    if (path.length <= 1) return
    const next = path.slice(0, -1)
    const parent = next[next.length - 1]
    void load(parent.id, parent.name, next)
  }

  const saveFile = () => {
    if (node.type !== 'file') return
    void withWallet(async () => {
      await stuffFilesystemStore.set(currentId, node)
      setStatus('Saved securely in Stuff.')
    })
  }

  const addToDesktop = () => {
    if (node.type !== 'file') return
    const file = {
      schema: 'babbage-os-desktop-file' as const, schemaVersion: '1.0' as const,
      id: currentId, name: currentName, stuffUrl: stuffUrlForNode(currentId),
      mimeType: node.mimeType, extension: currentName.split('.').pop(), preferredAppId: 'stuff',
      createdAt: new Date().toISOString()
    }
    const hasItem = profile.desktopItems.some((item) => item.kind === 'file' && item.targetId === file.id)
    onProfileChange({
      ...profile,
      desktopFiles: [...profile.desktopFiles.filter((item) => item.id !== file.id), file],
      desktopItems: hasItem ? profile.desktopItems : [...profile.desktopItems, { id: `desktop-file-${file.id}`, kind: 'file', targetId: file.id, x: 448, y: 28 }]
    }, 'Stuff file shortcut')
    setStatus('Added to your Babbage OS desktop.')
  }

  if (loading) return <div className="empty-state"><span className="loading-orbit" /><h2>Opening Stuff…</h2><p>Approve the grouped Babbage OS storage request in your wallet if asked.</p></div>

  return <div className="stuff-app">
    <header className="stuff-toolbar"><button aria-label="Back" disabled={path.length <= 1} onClick={goBack}><ArrowLeft /></button><div><span className="eyebrow">Encrypted Stuff filesystem</span><strong>{path.map((item) => item.name).join(' / ')}</strong></div>{node.type === 'folder' ? <><button onClick={() => createEntry('folder')} disabled={busy}><FolderPlus /> New folder</button><button onClick={() => createEntry('file')} disabled={busy}><Plus /> New file</button></> : <><button onClick={addToDesktop}><ExternalLink /> Add to desktop</button><button onClick={saveFile} disabled={busy}><Save /> Save</button></>}</header>
    {needsWallet && <section className="stuff-wallet-callout"><WalletCards /><div><strong>Connect to save in Stuff</strong><p>Your files are encrypted and stored through WalletClient. Stuff has no embedded wallet.</p></div><button onClick={() => void connect()} disabled={busy}>{busy ? 'Waiting…' : 'Connect Babbage Go'}</button></section>}
    {status && <p className="stuff-status" role="status">{status}</p>}
    {node.type === 'folder' ? <div className="stuff-grid">{node.nodes.length ? node.nodes.map((entry) => <article key={entry.id}><button className="stuff-entry" onClick={() => openEntry(entry)}><span>{entry.type === 'folder' ? <Folder /> : <FileText />}</span><strong>{entry.name}</strong><small>{entry.type === 'folder' ? 'Folder' : entry.mimeType}</small></button><div><button aria-label={`Rename ${entry.name}`} onClick={() => renameEntry(entry)}><Pencil /></button><button aria-label={`Delete ${entry.name}`} onClick={() => deleteEntry(entry)}><Trash2 /></button></div></article>) : <div className="empty-state"><Folder /><h2>{needsWallet ? 'Your files appear after you connect.' : 'This folder is empty.'}</h2><p>Create a folder or file to get started.</p></div>}</div> : <div className="stuff-editor"><label><span>{currentName}</span><textarea aria-label="File contents" value={node.contents} onChange={(event) => setNode({ ...node, contents: event.target.value })} /></label></div>}
  </div>
}

export function AppPlaceholder({ title }: { title: string }) {
  return <div className="empty-state"><Plus /><h2>{title}</h2><p>This system surface is ready for an integration.</p></div>
}

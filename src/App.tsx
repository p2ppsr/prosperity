import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Rnd } from 'react-rnd'
import {
  AppWindow, ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  Cloud, ExternalLink, Fullscreen, Grid3X3, LockKeyhole, Maximize2, Menu,
  MessageCircle, Minus, MonitorUp, MoreHorizontal, Plus, RotateCcw, Search,
  Settings as SettingsIcon, Smartphone, WalletCards, Wifi, X
} from 'lucide-react'

import { AppIcon } from './components/AppIcon'
import { BrowserApp, FeedbackApp, HelpCenter, SettingsApp } from './components/InternalApps'
import { DEFAULT_APPS } from './data/apps'
import { resolveFileApp } from './lib/fileAssociations'
import { nudgeDesktopItem, positionDesktopItem, reorderMobileItem } from './lib/layout'
import { createDefaultProfile, walletInstallUrl, walletProfileStore } from './lib/profile'
import type {
  BabbageAppManifestV1, BabbageDesktopFileV1, DesktopItem, MobileItem,
  PersistedProfileV1, WindowBounds, WindowState
} from './types/manifest'

type WalletStatus = 'checking' | 'guest' | 'connecting' | 'connected' | 'error'
type SaveRequest = { profile: PersistedProfileV1; reason: string }

const STUFF_ORIGIN = 'https://frontend.8269defdfbae9c6d217aa158ae29e9be.projects.babbage.systems'

function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 720px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 720px)')
    const update = () => setMobile(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return mobile
}

function Clock({ profile }: { profile: PersistedProfileV1 }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), profile.settings.showSeconds ? 1000 : 15000)
    return () => window.clearInterval(timer)
  }, [profile.settings.showSeconds])
  const formatted = new Intl.DateTimeFormat(undefined, {
    timeZone: profile.settings.timezone,
    hour: 'numeric', minute: '2-digit', second: profile.settings.showSeconds ? '2-digit' : undefined,
    hour12: !profile.settings.clock24Hour
  }).format(now)
  const date = new Intl.DateTimeFormat(undefined, { timeZone: profile.settings.timezone, month: 'short', day: 'numeric' }).format(now)
  return <time dateTime={now.toISOString()}><strong>{formatted}</strong><span>{date}</span></time>
}

export default function App() {
  const [profile, setProfile] = useState(createDefaultProfile)
  const [windows, setWindows] = useState<WindowState[]>([])
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('checking')
  const [saveRequest, setSaveRequest] = useState<SaveRequest | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [launcherQuery, setLauncherQuery] = useState('')
  const [addAppOpen, setAddAppOpen] = useState(false)
  const [addFileOpen, setAddFileOpen] = useState(false)
  const [mobileAppId, setMobileAppId] = useState<string | null>(null)
  const [mobileEditing, setMobileEditing] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const desktopRef = useRef<HTMLDivElement>(null)
  const zIndex = useRef(20)
  const isMobile = useMobile()

  useEffect(() => {
    let active = true
    void walletProfileStore.isConnected().then(async (connected) => {
      if (!active) return
      if (!connected) { setWalletStatus('guest'); return }
      try {
        const saved = await walletProfileStore.load()
        if (active && saved) setProfile(saved)
        if (active) setWalletStatus('connected')
      } catch {
        if (active) setWalletStatus('error')
      }
    })
    return () => { active = false }
  }, [])

  const persist = useCallback(async (next: PersistedProfileV1, reason: string) => {
    setProfile(next)
    const connected = walletStatus === 'connected' || await walletProfileStore.isConnected()
    if (!connected) {
      setWalletStatus('guest')
      setSaveRequest({ profile: next, reason })
      return
    }
    try {
      setSaveMessage('Saving securely…')
      await walletProfileStore.save(next)
      setWalletStatus('connected')
      setSaveMessage('Saved to your wallet')
      window.setTimeout(() => setSaveMessage(''), 2200)
    } catch {
      setWalletStatus('error')
      setSaveRequest({ profile: next, reason })
      setSaveMessage('')
    }
  }, [walletStatus])

  const connectAndSave = async () => {
    if (!saveRequest) return
    setWalletStatus('connecting')
    try {
      await walletProfileStore.connect()
      await walletProfileStore.save(saveRequest.profile)
      setProfile(saveRequest.profile)
      setSaveRequest(null)
      setWalletStatus('connected')
      setSaveMessage('Saved to your wallet')
      window.setTimeout(() => setSaveMessage(''), 2200)
    } catch {
      setWalletStatus('error')
    }
  }

  const focusWindow = (id: string) => {
    zIndex.current += 1
    setWindows((current) => current.map((item) => item.id === id ? { ...item, minimized: false, zIndex: zIndex.current } : item))
  }

  const openApp = useCallback((appId: string, url?: string, title?: string) => {
    const app = profile.installedApps.find((candidate) => candidate.id === appId)
    if (!app) return
    if (isMobile) { setMobileAppId(appId); setLauncherOpen(false); return }
    const existing = windows.find((item) => item.appId === appId && (!url || item.url === url))
    if (existing) { focusWindow(existing.id); setLauncherOpen(false); return }
    const width = Math.min(app.window.width, window.innerWidth - 56)
    const height = Math.min(app.window.height, window.innerHeight - 108)
    const offset = windows.length % 7
    zIndex.current += 1
    setWindows((current) => [...current, {
      id: crypto.randomUUID(), appId, title: title ?? app.name, url: url ?? (app.launch.kind === 'iframe' ? app.launch.url : undefined),
      x: Math.max(12, (window.innerWidth - width) / 2 + offset * 18), y: 44 + offset * 16,
      width, height, minimized: false, maximized: false, zIndex: zIndex.current
    }])
    setLauncherOpen(false)
  }, [isMobile, profile.installedApps, windows])

  const closeWindow = (id: string) => setWindows((current) => current.filter((item) => item.id !== id))
  const minimizeWindow = (id: string) => setWindows((current) => current.map((item) => item.id === id ? { ...item, minimized: true } : item))
  const maximizeWindow = (id: string) => setWindows((current) => current.map((item) => {
    if (item.id !== id) return item
    if (item.maximized && item.restoreBounds) return { ...item, ...item.restoreBounds, restoreBounds: undefined, maximized: false }
    const restoreBounds: WindowBounds = { x: item.x, y: item.y, width: item.width, height: item.height }
    return { ...item, x: 8, y: 8, width: window.innerWidth - 16, height: window.innerHeight - 72, restoreBounds, maximized: true }
  }))

  const updateWindow = (id: string, bounds: Partial<WindowBounds>) => setWindows((current) => current.map((item) => item.id === id ? { ...item, ...bounds } : item))

  const updateDesktopItem = (id: string, x: number, y: number) => {
    const rect = desktopRef.current?.getBoundingClientRect()
    if (!rect) return
    const next = positionDesktopItem(profile, id, x, y, rect)
    void persist(next, 'desktop icon position')
  }

  const nudgeDesktop = (id: string, deltaX: number, deltaY: number) => {
    const rect = desktopRef.current?.getBoundingClientRect()
    if (!rect) return
    const next = nudgeDesktopItem(profile, id, deltaX, deltaY, rect)
    if (next !== profile) void persist(next, 'desktop icon position')
  }

  const openDesktopItem = (item: DesktopItem | MobileItem) => {
    if (item.kind === 'app') openApp(item.targetId)
    else {
      const file = profile.desktopFiles.find((candidate) => candidate.id === item.targetId)
      if (!file) return
      const app = resolveFileApp(file, profile.installedApps)
      if (app) openApp(app.id, file.stuffUrl, file.name)
    }
  }

  useEffect(() => {
    const receiveStuffFile = (event: MessageEvent) => {
      if (event.origin !== STUFF_ORIGIN || event.data?.type !== 'babbage-os:add-desktop-file') return
      const candidate = event.data.file as Partial<BabbageDesktopFileV1>
      if (!candidate.name || !candidate.stuffUrl || !candidate.mimeType) return
      let url: URL
      try { url = new URL(candidate.stuffUrl) } catch { return }
      if (url.protocol !== 'https:') return
      const file: BabbageDesktopFileV1 = {
        schema: 'babbage-os-desktop-file', schemaVersion: '1.0', id: candidate.id || crypto.randomUUID(),
        name: candidate.name.slice(0, 180), stuffUrl: url.toString(), mimeType: candidate.mimeType.slice(0, 120),
        extension: candidate.extension?.slice(0, 24), preferredAppId: candidate.preferredAppId, createdAt: candidate.createdAt || new Date().toISOString()
      }
      const next = {
        ...profile,
        desktopFiles: [...profile.desktopFiles.filter((item) => item.id !== file.id), file],
        desktopItems: [...profile.desktopItems.filter((item) => item.targetId !== file.id), { id: `desktop-file-${file.id}`, kind: 'file' as const, targetId: file.id, x: 236, y: 28 }]
      }
      void persist(next, 'Stuff file shortcut')
    }
    window.addEventListener('message', receiveStuffFile)
    return () => window.removeEventListener('message', receiveStuffFile)
  }, [persist, profile])

  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  const resolvedTheme = profile.settings.theme === 'system' ? systemTheme : profile.settings.theme
  const wallpaper = profile.settings.wallpaper === 'custom' && profile.settings.customWallpaperUrl
    ? profile.settings.customWallpaperUrl : `/wallpapers/${profile.settings.wallpaper}.png`
  const rootClass = `os-root theme-${resolvedTheme} accent-${profile.settings.accent}${profile.settings.reduceMotion ? ' reduce-motion' : ''}`

  const launcherApps = profile.installedApps.filter((app) => `${app.name} ${app.description} ${app.category}`.toLowerCase().includes(launcherQuery.toLowerCase()))
  const activeMobileApp = profile.installedApps.find((app) => app.id === mobileAppId)

  return <main className={rootClass} style={{ '--wallpaper': `url("${wallpaper.replaceAll('"', '%22')}")` } as React.CSSProperties}>
    {!isMobile ? <div className="desktop-shell" ref={desktopRef} onMouseDown={() => { setLauncherOpen(false); setNotificationsOpen(false) }}>
      <div className="desktop-icons">
        {profile.desktopItems.map((item) => <DesktopIcon key={item.id} item={item} profile={profile} onOpen={() => openDesktopItem(item)} onMove={(x, y) => updateDesktopItem(item.id, x, y)} onNudge={(deltaX, deltaY) => nudgeDesktop(item.id, deltaX, deltaY)} />)}
      </div>
      <div className="window-layer">
        {windows.map((windowState) => {
          const app = profile.installedApps.find((candidate) => candidate.id === windowState.appId)
          if (!app || windowState.minimized) return null
          return <Rnd
            key={windowState.id}
            bounds="parent"
            position={{ x: windowState.x, y: windowState.y }}
            size={{ width: windowState.width, height: windowState.height }}
            minWidth={app.window.minWidth} minHeight={app.window.minHeight}
            disableDragging={windowState.maximized} enableResizing={!windowState.maximized}
            dragHandleClassName="window-titlebar__drag"
            style={{ zIndex: windowState.zIndex }}
            onMouseDown={() => focusWindow(windowState.id)}
            onDragStop={(_, data) => updateWindow(windowState.id, { x: data.x, y: data.y })}
            onResizeStop={(_, __, element, ___, position) => updateWindow(windowState.id, { ...position, width: element.offsetWidth, height: element.offsetHeight })}
          >
            <AppWindowFrame app={app} windowState={windowState} profile={profile} onProfileChange={(next, reason) => void persist(next, reason)} onMinimize={() => minimizeWindow(windowState.id)} onMaximize={() => maximizeWindow(windowState.id)} onClose={() => closeWindow(windowState.id)} />
          </Rnd>
        })}
      </div>
      <Taskbar profile={profile} windows={windows} walletStatus={walletStatus} launcherOpen={launcherOpen} notificationsOpen={notificationsOpen} onLauncher={() => setLauncherOpen((value) => !value)} onWindow={focusWindow} onFeedback={() => openApp('feedback')} onHelp={() => openApp('help')} onSettings={() => openApp('settings')} onNotifications={() => setNotificationsOpen((value) => !value)} />
      {launcherOpen && <Launcher apps={launcherApps} query={launcherQuery} onQuery={setLauncherQuery} onOpen={openApp} onAddApp={() => setAddAppOpen(true)} onAddFile={() => setAddFileOpen(true)} />}
      {notificationsOpen && <NotificationCenter walletStatus={walletStatus} saveMessage={saveMessage} onFeedback={() => openApp('feedback')} />}
    </div> : <MobileHome profile={profile} activeApp={activeMobileApp} editing={mobileEditing} walletStatus={walletStatus} onEditing={setMobileEditing} onOpen={openApp} onCloseApp={() => setMobileAppId(null)} onProfileChange={(next, reason) => void persist(next, reason)} onMove={(id, direction) => {
      const next = reorderMobileItem(profile, id, direction < 0 ? -1 : 1)
      if (next === profile) return
      void persist(next, 'mobile home order')
    }} onFeedback={() => openApp('feedback')} onHelp={() => openApp('help')} onSettings={() => openApp('settings')} />}
    {saveRequest && <WalletDialog status={walletStatus} reason={saveRequest.reason} onConnect={() => void connectAndSave()} onDismiss={() => { setSaveRequest(null); if (walletStatus === 'error') setWalletStatus('guest') }} />}
    {addAppOpen && <AddAppDialog onClose={() => setAddAppOpen(false)} onAdd={(app) => { const next = { ...profile, installedApps: [...profile.installedApps, app], desktopItems: [...profile.desktopItems, { id: `desktop-${app.id}`, kind: 'app' as const, targetId: app.id, x: 340, y: 28 }], mobileItems: [...profile.mobileItems, { id: `mobile-${app.id}`, kind: 'app' as const, targetId: app.id, order: profile.mobileItems.length }] }; setAddAppOpen(false); void persist(next, 'installed app') }} />}
    {addFileOpen && <AddFileDialog apps={profile.installedApps} onClose={() => setAddFileOpen(false)} onAdd={(file) => { const next = { ...profile, desktopFiles: [...profile.desktopFiles, file], desktopItems: [...profile.desktopItems, { id: `desktop-file-${file.id}`, kind: 'file' as const, targetId: file.id, x: 448, y: 28 }] }; setAddFileOpen(false); void persist(next, 'Stuff file shortcut') }} />}
    {saveMessage && <div className="save-toast" role="status"><Cloud size={17} />{saveMessage}</div>}
  </main>
}

function DesktopIcon({ item, profile, onOpen, onMove, onNudge }: { item: DesktopItem; profile: PersistedProfileV1; onOpen: () => void; onMove: (x: number, y: number) => void; onNudge: (deltaX: number, deltaY: number) => void }) {
  const app = item.kind === 'app' ? profile.installedApps.find((candidate) => candidate.id === item.targetId) : undefined
  const file = item.kind === 'file' ? profile.desktopFiles.find((candidate) => candidate.id === item.targetId) : undefined
  if (!app && !file) return null
  return <button className="desktop-icon" draggable onDragEnd={(event) => onMove(event.clientX, event.clientY)} onDoubleClick={onOpen} onKeyDown={(event) => { if (!event.altKey) return; const directions: Record<string, [number, number]> = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }; const movement = directions[event.key]; if (!movement) return; event.preventDefault(); onNudge(...movement) }} style={{ transform: `translate(${item.x}px, ${item.y}px)` }} title={`Open ${app?.name ?? file?.name}. Hold Alt and use arrow keys to move.`}>
    <span className={`app-icon-tile app-icon-tile--${app?.category ?? 'files'}`}>{app ? <AppIcon name={app.icon} size={34} /> : <AppIcon name="document" size={34} />}</span>
    <span>{app?.shortName ?? file?.name}</span>
  </button>
}

function AppWindowFrame({ app, windowState, profile, onProfileChange, onMinimize, onMaximize, onClose }: { app: BabbageAppManifestV1; windowState: WindowState; profile: PersistedProfileV1; onProfileChange: (profile: PersistedProfileV1, reason: string) => void; onMinimize: () => void; onMaximize: () => void; onClose: () => void }) {
  return <section className="os-window" aria-label={`${windowState.title} window`}>
    <header className="window-titlebar">
      <div className="window-titlebar__drag"><span className={`mini-app-icon app-icon-tile--${app.category}`}><AppIcon name={app.icon} size={17} /></span><strong>{windowState.title}</strong>{app.capabilities.includes('wallet') && <span className="wallet-native"><LockKeyhole size={12} /> Wallet native</span>}</div>
      <div className="window-actions"><button aria-label="Minimize" onClick={onMinimize}><Minus /></button><button aria-label={windowState.maximized ? 'Restore' : 'Maximize'} onClick={onMaximize}>{windowState.maximized ? <RotateCcw /> : <Maximize2 />}</button><button className="window-close" aria-label="Close" onClick={onClose}><X /></button></div>
    </header>
    <div className="window-content">
      {app.launch.kind === 'iframe' ? <><iframe title={windowState.title} src={windowState.url ?? app.launch.url} sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads allow-modals" allow="clipboard-read; clipboard-write; camera; microphone; fullscreen" /><a className="external-app-link" href={windowState.url ?? app.launch.url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open externally</a></> : <InternalApp appId={app.id} profile={profile} onProfileChange={onProfileChange} />}
    </div>
  </section>
}

function InternalApp({ appId, profile, onProfileChange }: { appId: string; profile: PersistedProfileV1; onProfileChange: (profile: PersistedProfileV1, reason: string) => void }) {
  if (appId === 'browser') return <BrowserApp profile={profile} onBrowserChange={(browser) => onProfileChange({ ...profile, browser }, 'browser data')} />
  if (appId === 'settings') return <SettingsApp settings={profile.settings} mobileItems={profile.mobileItems} installedApps={profile.installedApps} onChange={(settings) => onProfileChange({ ...profile, settings }, 'system settings')} onMoveMobile={(id, direction) => { const next = reorderMobileItem(profile, id, direction); if (next !== profile) onProfileChange(next, 'mobile home order') }} />
  if (appId === 'help') return <HelpCenter />
  if (appId === 'feedback') return <FeedbackApp />
  return null
}

function Taskbar({ profile, windows, walletStatus, launcherOpen, notificationsOpen, onLauncher, onWindow, onFeedback, onHelp, onSettings, onNotifications }: { profile: PersistedProfileV1; windows: WindowState[]; walletStatus: WalletStatus; launcherOpen: boolean; notificationsOpen: boolean; onLauncher: () => void; onWindow: (id: string) => void; onFeedback: () => void; onHelp: () => void; onSettings: () => void; onNotifications: () => void }) {
  return <footer className="taskbar" onMouseDown={(event) => event.stopPropagation()}>
    <button className={launcherOpen ? 'taskbar-launch active' : 'taskbar-launch'} aria-label="Open app launcher" onClick={onLauncher}><Grid3X3 /></button>
    <div className="taskbar-apps">{windows.map((item) => { const app = profile.installedApps.find((candidate) => candidate.id === item.appId); return app ? <button className={!item.minimized && item.zIndex === Math.max(...windows.filter((candidate) => !candidate.minimized).map((candidate) => candidate.zIndex), 0) ? 'active' : ''} key={item.id} title={item.title} onClick={() => onWindow(item.id)}><AppIcon name={app.icon} size={21} /></button> : null })}</div>
    <div className="system-tray">
      <button title="Send feedback" onClick={onFeedback}><MessageCircle /></button>
      <button title="Help Center" onClick={onHelp}><CircleHelp /></button>
      <button title="System Settings" onClick={onSettings}><SettingsIcon /></button>
      <button className={`wallet-indicator wallet-indicator--${walletStatus}`} title={`Wallet: ${walletStatus}`} onClick={onNotifications}><WalletCards /><span>{walletStatus === 'connected' ? 'Connected' : 'Guest'}</span></button>
      <button className={notificationsOpen ? 'tray-clock active' : 'tray-clock'} onClick={onNotifications}><Clock profile={profile} /></button>
    </div>
  </footer>
}

function Launcher({ apps, query, onQuery, onOpen, onAddApp, onAddFile }: { apps: BabbageAppManifestV1[]; query: string; onQuery: (value: string) => void; onOpen: (id: string) => void; onAddApp: () => void; onAddFile: () => void }) {
  return <section className="launcher-panel" onMouseDown={(event) => event.stopPropagation()}>
    <header><div><span className="eyebrow">BRC-100 native</span><h2>Applications</h2></div><span className="launcher-mark"><AppWindow /></span></header>
    <label className="launcher-search"><Search /><input autoFocus placeholder="Search apps…" value={query} onChange={(event) => onQuery(event.target.value)} /></label>
    <div className="launcher-grid">{apps.map((app) => <button key={app.id} onClick={() => onOpen(app.id)}><span className={`app-icon-tile app-icon-tile--${app.category}`}><AppIcon name={app.icon} /></span><span><strong>{app.name}</strong><small>{app.description}</small></span></button>)}</div>
    <footer><button onClick={onAddApp}><Plus /> Add app</button><button onClick={onAddFile}><Plus /> Add Stuff file</button><span><Wifi /> Open network</span></footer>
  </section>
}

function NotificationCenter({ walletStatus, saveMessage, onFeedback }: { walletStatus: WalletStatus; saveMessage: string; onFeedback: () => void }) {
  return <aside className="notification-center" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="eyebrow">System center</span><h2>All systems ready</h2></div><Wifi /></header><article><span className={`status-dot status-dot--${walletStatus}`} /><div><strong>{walletStatus === 'connected' ? 'Wallet connected' : 'Exploring as a guest'}</strong><p>{walletStatus === 'connected' ? 'Encrypted profile persistence is available.' : 'Apps work now. Saving will ask for Babbage Go.'}</p></div></article>{saveMessage && <article><Cloud /><div><strong>Profile</strong><p>{saveMessage}</p></div></article>}<button className="notification-feedback" onClick={onFeedback}><MessageCircle /> Send Babbage OS feedback</button></aside>
}

function MobileHome({ profile, activeApp, editing, walletStatus, onEditing, onOpen, onCloseApp, onProfileChange, onMove, onFeedback, onHelp, onSettings }: { profile: PersistedProfileV1; activeApp?: BabbageAppManifestV1; editing: boolean; walletStatus: WalletStatus; onEditing: (value: boolean) => void; onOpen: (id: string) => void; onCloseApp: () => void; onProfileChange: (profile: PersistedProfileV1, reason: string) => void; onMove: (id: string, direction: number) => void; onFeedback: () => void; onHelp: () => void; onSettings: () => void }) {
  const items = [...profile.mobileItems].sort((a, b) => a.order - b.order)
  if (activeApp) return <section className="mobile-app"><header><button onClick={onCloseApp}><ArrowLeft /> Home</button><div><AppIcon name={activeApp.icon} size={19} /><strong>{activeApp.name}</strong></div>{activeApp.launch.kind === 'iframe' ? <a href={activeApp.launch.url} target="_blank" rel="noreferrer"><ExternalLink /></a> : <span />}</header><div>{activeApp.launch.kind === 'iframe' ? <iframe title={activeApp.name} src={activeApp.launch.url} sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads allow-modals" allow="clipboard-read; clipboard-write; camera; microphone; fullscreen" /> : <InternalApp appId={activeApp.id} profile={profile} onProfileChange={onProfileChange} />}</div></section>
  return <section className="mobile-home">
    <header><div><span className="mobile-logo"><AppWindow /></span><div><span className="eyebrow">Personal computing</span><strong>Babbage OS</strong></div></div><button onClick={() => onEditing(!editing)}>{editing ? 'Done' : <MoreHorizontal />}</button></header>
    <div className="mobile-widget"><div><span className="eyebrow">Your Metanet</span><h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}.</h1><p>{walletStatus === 'connected' ? 'Your encrypted workspace is connected.' : 'Explore freely. Connect only when you save.'}</p></div><Clock profile={profile} /></div>
    <div className={editing ? 'mobile-grid editing' : 'mobile-grid'}>{items.map((item, index) => { const app = profile.installedApps.find((candidate) => candidate.id === item.targetId); if (!app) return null; return <div className="mobile-icon-wrap" key={item.id}><button className="mobile-icon" onClick={() => !editing && onOpen(app.id)}><span className={`app-icon-tile app-icon-tile--${app.category}`}><AppIcon name={app.icon} size={30} /></span><span>{app.shortName}</span></button>{editing && <span className="mobile-reorder"><button disabled={index === 0} onClick={() => onMove(item.id, -1)}><ChevronLeft /></button><button disabled={index === items.length - 1} onClick={() => onMove(item.id, 1)}><ChevronRight /></button></span>}</div>})}</div>
    <nav className="mobile-dock"><button onClick={() => onOpen('stuff')}><AppIcon name="folder" /></button><button onClick={() => onOpen('convo')}><AppIcon name="messages" /></button><button onClick={() => onOpen('browser')}><AppIcon name="globe" /></button><button onClick={onFeedback}><MessageCircle /></button></nav>
    <footer><button onClick={onHelp}><CircleHelp /> Help</button><button onClick={onSettings}><SettingsIcon /> Settings</button><span><WalletCards /> {walletStatus === 'connected' ? 'Connected' : 'Guest'}</span></footer>
  </section>
}

function WalletDialog({ status, reason, onConnect, onDismiss }: { status: WalletStatus; reason: string; onConnect: () => void; onDismiss: () => void }) {
  return <div className="dialog-backdrop" role="presentation"><section className="wallet-dialog" role="dialog" aria-modal="true" aria-labelledby="wallet-dialog-title"><button className="dialog-close" aria-label="Close" onClick={onDismiss}><X /></button><span className="wallet-hero"><WalletCards /></span><span className="eyebrow">Your keys stay yours</span><h2 id="wallet-dialog-title">Connect to save {reason}</h2><p>Babbage OS works in guest mode, but persistence is wallet-native. Connect Babbage Go to encrypt and save this change through WalletClient.</p>{status === 'error' && <p className="inline-error">No available wallet responded. Install or unlock Babbage Go, then retry.</p>}<button className="primary-button" disabled={status === 'connecting'} onClick={onConnect}>{status === 'connecting' ? 'Waiting for wallet…' : 'Connect Babbage Go'}</button><a className="secondary-button" href={walletInstallUrl()} target="_blank" rel="noreferrer">Get a wallet <ExternalLink /></a><button className="text-button" onClick={onDismiss}>Keep exploring without saving</button></section></div>
}

function AddAppDialog({ onClose, onAdd }: { onClose: () => void; onAdd: (app: BabbageAppManifestV1) => void }) {
  const [form, setForm] = useState({ name: '', url: '', description: '' })
  const [error, setError] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    try {
      const url = new URL(form.url)
      if (url.protocol !== 'https:') throw new Error('App URLs must use HTTPS.')
      const id = `custom-${crypto.randomUUID()}`
      onAdd({ schema: 'babbage-os-app', schemaVersion: '1.0', id, name: form.name.trim(), shortName: form.name.trim().slice(0, 18), description: form.description.trim() || `Installed from ${url.hostname}`, launch: { kind: 'iframe', url: url.toString() }, icon: 'sparkles', category: 'utilities', capabilities: ['wallet'], window: { width: 960, height: 700, minWidth: 480, minHeight: 420 } })
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Invalid app details.') }
  }
  return <Dialog title="Add an app" eyebrow="BabbageAppManifestV1" onClose={onClose}><p>Install a secure web app into both your desktop and mobile home screen.</p><form className="stack-form" onSubmit={submit}><label>App name<input required maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>HTTPS launch URL<input required type="url" placeholder="https://…" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} /></label><label>Description<textarea rows={3} maxLength={240} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>{error && <p className="inline-error">{error}</p>}<button className="primary-button">Add to Babbage OS</button></form></Dialog>
}

function AddFileDialog({ apps, onClose, onAdd }: { apps: BabbageAppManifestV1[]; onClose: () => void; onAdd: (file: BabbageDesktopFileV1) => void }) {
  const [form, setForm] = useState({ name: '', url: '', mimeType: 'text/plain', preferredAppId: '' })
  const [error, setError] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    try {
      const url = new URL(form.url)
      if (url.protocol !== 'https:') throw new Error('Stuff file URLs must use HTTPS.')
      onAdd({ schema: 'babbage-os-desktop-file', schemaVersion: '1.0', id: crypto.randomUUID(), name: form.name.trim(), stuffUrl: url.toString(), mimeType: form.mimeType.trim(), extension: form.name.split('.').pop(), preferredAppId: form.preferredAppId || undefined, createdAt: new Date().toISOString() })
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Invalid file shortcut.') }
  }
  return <Dialog title="Add a Stuff file" eyebrow="BabbageDesktopFileV1" onClose={onClose}><p>Add a portable filesystem shortcut. The file itself stays in Stuff.</p><form className="stack-form" onSubmit={submit}><label>Display name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Stuff URL<input required type="url" placeholder="https://…" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} /></label><label>MIME type<input required value={form.mimeType} onChange={(event) => setForm({ ...form, mimeType: event.target.value })} /></label><label>Preferred app<select value={form.preferredAppId} onChange={(event) => setForm({ ...form, preferredAppId: event.target.value })}><option value="">Choose automatically</option>{apps.map((app) => <option value={app.id} key={app.id}>{app.name}</option>)}</select></label>{error && <p className="inline-error">{error}</p>}<button className="primary-button">Add to desktop</button></form></Dialog>
}

function Dialog({ title, eyebrow, onClose, children }: { title: string; eyebrow: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="dialog-backdrop" role="presentation"><section className="generic-dialog" role="dialog" aria-modal="true"><button className="dialog-close" aria-label="Close" onClick={onClose}><X /></button><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{children}</section></div>
}

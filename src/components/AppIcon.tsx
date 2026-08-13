import {
  Bot, CheckSquare2, CircleHelp, FileText, Folder, Globe2, GraduationCap,
  Library, MessageCircle, MessagesSquare, Music2, Newspaper, PieChart, Settings,
  ShieldCheck, Sparkles
} from 'lucide-react'

const icons = {
  folder: Folder,
  messages: MessagesSquare,
  document: FileText,
  'check-square': CheckSquare2,
  sparkles: Sparkles,
  globe: Globe2,
  music: Music2,
  newspaper: Newspaper,
  chart: PieChart,
  graduation: GraduationCap,
  settings: Settings,
  help: CircleHelp,
  'message-circle': MessageCircle,
  shield: ShieldCheck,
  library: Library,
  bot: Bot
}

export function AppIcon({ name, size = 28 }: { name: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] ?? Sparkles
  return <Icon aria-hidden="true" size={size} strokeWidth={1.8} />
}

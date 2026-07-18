import { BedDouble, Bot, CalendarDays, Home, Library } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  ['/', 'ホーム', Home], ['/itinerary', '旅程', CalendarDays], ['/transport', '交通・宿泊', BedDouble], ['/documents', '資料', Library], ['/chat', 'チャット', Bot]
] as const

export function BottomNav() {
  return <nav aria-label="メインナビゲーション" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
    <div className="mx-auto grid max-w-3xl grid-cols-5">
      {items.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${isActive ? 'text-sky-700' : 'text-slate-500'}`}>
        <Icon size={21} aria-hidden="true"/><span>{label}</span>
      </NavLink>)}
    </div>
  </nav>
}

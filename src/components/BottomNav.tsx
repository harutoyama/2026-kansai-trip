import { CalendarDays, Compass, Route, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'ホーム', Icon: Compass },
  { to: '/itinerary', label: '旅程', Icon: CalendarDays },
  { to: '/planning', label: '計画', Icon: Sparkles },
  { to: '/transport', label: '交通', Icon: Route }
] as const

export function BottomNav() {
  return (
    <nav aria-label="メインナビゲーション" className="cinema-nav">
      <div className="cinema-nav-inner">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }: { isActive: boolean }) => `cinema-nav-link ${isActive ? 'is-active' : ''}`}
          >
            <span className="cinema-nav-icon" aria-hidden="true">
              <Icon size={20} strokeWidth={1.7} />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

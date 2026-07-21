import { CalendarRange, ChevronDown, ExternalLink, Hotel } from 'lucide-react'
import { EventCard } from '../components/EventCard'
import { tripDays, tripStays } from '../data/trip'

const datedTransportEvents = tripDays.flatMap((day) => [
  ...(day.groups?.flatMap((group) => group.events) ?? []),
  ...(day.commonEvents ?? []),
  ...(day.events ?? [])
].filter((event) => event.transport).map((event) => ({ date: day.date, event })))

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Tokyo'
  }).format(new Date(`${date}T00:00:00+09:00`))
}

export function TransportPage() {
  return (
    <div className="cinema-page">
      <header className="cinema-page-header">
        <p className="cinema-page-kicker">ROUTES & STAYS</p>
        <h1>交通・宿泊</h1>
        <p>旅程データを正本として、確定済みの便・列車・座席と宿泊先を一覧表示します。</p>
      </header>

      <section className="cinema-page-section cinema-transport-section">
        <div className="cinema-section-label">
          <span>予約済み交通</span>
          <i />
        </div>
        <div className="cinema-transport-date-groups">
          {datedTransportEvents.map(({ date, event }) => (
            <div className="cinema-transport-event-wrap" key={event.id}>
              <p className="cinema-transport-date"><CalendarRange size={14} strokeWidth={1.8} aria-hidden="true" /> {formatDate(date)}</p>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </section>

      <section className="cinema-page-section">
        <div className="cinema-section-label">
          <span>宿泊</span>
          <i />
        </div>
        <div className="cinema-stay-list">
          {tripStays.map((stay) => {
            const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.mapsQuery)}`
            return (
              <article className="cinema-stay-card" key={stay.id}>
                <div className="cinema-stay-heading">
                  <span className="cinema-stay-icon" aria-hidden="true"><Hotel size={21} strokeWidth={1.7} /></span>
                  <div>
                    <p>{stay.nights}泊</p>
                    <h2>{stay.name}</h2>
                  </div>
                </div>
                <div className="cinema-stay-dates">
                  <div><small>CHECK IN</small><strong>{formatDate(stay.checkIn)}</strong></div>
                  <i aria-hidden="true" />
                  <div><small>CHECK OUT</small><strong>{formatDate(stay.checkOut)}</strong></div>
                </div>
                <details className="cinema-event-details cinema-stay-details">
                  <summary>
                    <span>詳細</span>
                    <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" />
                  </summary>
                  <div className="cinema-event-details-body">
                    <dl>
                      <div><dt>住所</dt><dd>{stay.address}</dd></div>
                    </dl>
                  </div>
                </details>
                <a href={maps} target="_blank" rel="noreferrer">
                  Google Mapsで開く <ExternalLink size={13} strokeWidth={1.8} aria-hidden="true" />
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <p className="cinema-security-note">予約番号、QRコード、電話番号などの機微情報は掲載しません。搭乗口・到着口・在来線番線は当日の案内を優先してください。</p>
    </div>
  )
}

import { ChevronDown, UsersRound } from 'lucide-react'
import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { EventCard } from '../components/EventCard'
import { tripDays } from '../data/trip'

export function ItineraryPage() {
  const [selected, setSelected] = useState(0)
  const [selectedGroupId, setSelectedGroupId] = useState('haru')
  const day = tripDays[selected]
  const selectedGroup = day.groups?.find((group) => group.id === selectedGroupId) ?? day.groups?.[0]

  return (
    <div className="cinema-page">
      <header className="cinema-page-header">
        <p className="cinema-page-kicker">THE SIX-DAY JOURNEY</p>
        <h1>旅程</h1>
        <p>時刻と番線を最優先に表示し、列車系統・座席・注意事項は「詳細」から確認できます。</p>
      </header>

      <div className="cinema-tab-strip" role="tablist" aria-label="旅行日">
        {tripDays.map((item, index) => (
          <button
            type="button"
            key={item.date}
            role="tab"
            aria-selected={selected === index}
            onClick={() => setSelected(index)}
            className={selected === index ? 'is-active' : ''}
          >
            <span>DAY {item.dayNumber}</span>
            <strong>8/{Number(item.date.slice(-2))}</strong>
          </button>
        ))}
      </div>

      <section className="cinema-day-intro">
        <p>{day.area}</p>
        <h2>{day.summary}</h2>
        {day.accommodation && <span>宿泊: {day.accommodation}</span>}
      </section>

      {day.groups && selectedGroup && (
        <section className="cinema-page-section">
          <div className="cinema-section-label">
            <span>11:20までの個別ルート</span>
            <i />
          </div>

          <label className="cinema-group-select">
            <span><UsersRound size={17} strokeWidth={1.8} aria-hidden="true" /> 表示する人</span>
            <span className="cinema-select-control">
              <select value={selectedGroup.id} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedGroupId(event.target.value)}>
                {day.groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.label}</option>
                ))}
              </select>
              <ChevronDown size={17} strokeWidth={1.8} aria-hidden="true" />
            </span>
          </label>

          {selectedGroup.members && (
            <p className="cinema-group-members">対象: {selectedGroup.members.join('・')}</p>
          )}
          <div className="cinema-event-list">
            {selectedGroup.events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      )}

      {day.commonEvents && (
        <section className="cinema-page-section">
          <div className="cinema-section-label">
            <span>11:20以降・4人共通</span>
            <i />
          </div>
          <div className="cinema-event-list">
            {day.commonEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      )}

      {day.events && (
        <section className="cinema-page-section">
          <div className="cinema-section-label">
            <span>家族共通タイムライン</span>
            <i />
          </div>
          <div className="cinema-event-list">
            {day.events.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      )}

      {day.undecided && (
        <section className="cinema-pending-card">
          <p>TO BE CONFIRMED</p>
          <h2>当日・今後の確認事項</h2>
          <ul>{day.undecided.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}
    </div>
  )
}

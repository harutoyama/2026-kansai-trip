import { ChevronDown, ExternalLink, MapPin } from 'lucide-react'
import type { TripEvent, TransportEndpoint } from '../types'

const certaintyLabels = {
  confirmed: '確定',
  candidate: '候補',
  undecided: '未定'
}

function endpointMeta(endpoint: TransportEndpoint, isFlight: boolean) {
  if (endpoint.platform) return endpoint.platform
  if (endpoint.terminal) return endpoint.terminal
  return isFlight ? '当日案内で確認' : '番線は当日確認'
}

function routeParts(location?: string) {
  if (!location?.includes('→')) return null
  const parts = location
    .split('→')
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.length >= 2 ? [parts[0], parts.at(-1) ?? ''] : null
}

export function EventCard({ event }: { event: TripEvent }) {
  const route = routeParts(event.location)
  const transport = event.transport
  const maps = event.showMap !== false && event.mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapsQuery)}`
    : null
  const isFlight = transport?.mode === 'flight'

  return (
    <article className="cinema-event-card">
      <div className="cinema-event-head">
        <div>
          <p className="cinema-event-time">
            {event.start ?? '時刻未定'}
            {event.end ? `–${event.end}` : ''}
          </p>
          <h3>{event.title}</h3>
        </div>
        <span className={`cinema-certainty is-${event.certainty}`}>
          {certaintyLabels[event.certainty]}
        </span>
      </div>

      {transport ? (
        <div className="cinema-departure-board" aria-label={`${transport.departure.name}から${transport.arrival.name}まで`}>
          <div>
            <small>出発</small>
            <strong>{transport.departure.time}</strong>
            <b>{transport.departure.name}</b>
            <span>{endpointMeta(transport.departure, isFlight)}</span>
          </div>
          <i aria-hidden="true" />
          <div>
            <small>到着</small>
            <strong>{transport.arrival.time}</strong>
            <b>{transport.arrival.name}</b>
            <span>{endpointMeta(transport.arrival, isFlight)}</span>
          </div>
        </div>
      ) : route ? (
        <div className="cinema-route-line" aria-label={`${route[0]}から${route[1]}まで`}>
          <strong>{route[0]}</strong>
          <span aria-hidden="true" />
          <strong>{route[1]}</strong>
        </div>
      ) : (
        event.location && <p className="cinema-event-location">{event.location}</p>
      )}

      {event.description && <p className="cinema-event-description">{event.description}</p>}

      {transport && (
        <details className="cinema-event-details">
          <summary>
            <span>詳細</span>
            <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" />
          </summary>
          <div className="cinema-event-details-body">
            <dl>
              {transport.service && (
                <div><dt>便・列車</dt><dd>{transport.service}{transport.serviceCode ? `（${transport.serviceCode}）` : ''}</dd></div>
              )}
              {transport.operator && <div><dt>運行</dt><dd>{transport.operator}</dd></div>}
              {transport.line && <div><dt>系統・路線</dt><dd>{transport.line}</dd></div>}
              {transport.equipment && <div><dt>車両・機材</dt><dd>{transport.equipment}</dd></div>}
              {transport.departure.terminal && <div><dt>出発ターミナル</dt><dd>{transport.departure.terminal}</dd></div>}
              {transport.arrival.terminal && <div><dt>到着ターミナル</dt><dd>{transport.arrival.terminal}</dd></div>}
            </dl>

            {transport.seats && transport.seats.length > 0 && (
              <div className="cinema-seat-section">
                <h4>座席</h4>
                <ul>
                  {transport.seats.map((seat, index) => (
                    <li key={`${seat.passenger}-${seat.car ?? ''}-${seat.seat}-${index}`}>
                      <span>{seat.passenger}</span>
                      <strong>{seat.car ? `${seat.car} ` : ''}{seat.seat}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {transport.stops && transport.stops.length > 0 && (
              <div className="cinema-detail-note">
                <h4>主な停車駅</h4>
                <p>{transport.stops.join(' → ')}</p>
              </div>
            )}

            {transport.notes && transport.notes.length > 0 && (
              <div className="cinema-detail-note">
                <h4>注意</h4>
                <ul>{transport.notes.map((note) => <li key={note}>{note}</li>)}</ul>
              </div>
            )}
          </div>
        </details>
      )}

      {maps && (
        <a className="cinema-map-link" href={maps} target="_blank" rel="noreferrer">
          <MapPin size={15} strokeWidth={1.8} aria-hidden="true" />
          Google Mapsで開く
          <ExternalLink size={13} strokeWidth={1.8} aria-hidden="true" />
        </a>
      )}
    </article>
  )
}

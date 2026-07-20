import type { TripEvent } from "../types";

const certaintyLabels = {
  confirmed: "確定",
  candidate: "候補",
  undecided: "未定",
};

function routeParts(location?: string) {
  if (!location?.includes("→")) return null;
  const parts = location
    .split("→")
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length >= 2 ? [parts[0], parts.at(-1) ?? ""] : null;
}

export function EventCard({ event }: { event: TripEvent }) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapsQuery ?? event.location ?? event.title)}`;
  const route = routeParts(event.location);

  return (
    <article className="cinema-event-card">
      <div className="cinema-event-head">
        <div>
          <p className="cinema-event-time">
            {event.start ?? "時刻未定"}
            {event.end ? `–${event.end}` : ""}
          </p>
          <h3>{event.title}</h3>
        </div>
        <span className={`cinema-certainty is-${event.certainty}`}>
          {certaintyLabels[event.certainty]}
        </span>
      </div>

      {route ? (
        <div
          className="cinema-route-line"
          aria-label={`${route[0]}から${route[1]}まで`}
        >
          <strong>{route[0]}</strong>
          <span aria-hidden="true" />
          <strong>{route[1]}</strong>
        </div>
      ) : (
        event.location && (
          <p className="cinema-event-location">{event.location}</p>
        )
      )}

      {event.description && (
        <p className="cinema-event-description">{event.description}</p>
      )}
      <a
        className="cinema-map-link"
        href={maps}
        target="_blank"
        rel="noreferrer"
      >
        Google Mapsで開く <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

import { useState } from "react";
import { EventCard } from "../components/EventCard";
import { tripDays } from "../data/trip";

export function ItineraryPage() {
  const [selected, setSelected] = useState(0);
  const day = tripDays[selected];

  return (
    <div className="cinema-page">
      <header className="cinema-page-header">
        <p className="cinema-page-kicker">THE SIX-DAY JOURNEY</p>
        <h1>旅程</h1>
        <p>家族4人の予定を、日ごとの物語として確認します。</p>
      </header>

      <div className="cinema-tab-strip" role="tablist" aria-label="旅行日">
        {tripDays.map((item, index) => (
          <button
            type="button"
            key={item.date}
            role="tab"
            aria-selected={selected === index}
            onClick={() => setSelected(index)}
            className={selected === index ? "is-active" : ""}
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

      {day.groups?.map((group) => (
        <section className="cinema-page-section" key={group.id}>
          <div className="cinema-section-label">
            <span>{group.label}</span>
            <i />
          </div>
          {group.members && (
            <p className="cinema-group-members">{group.members.join("・")}</p>
          )}
          <div className="cinema-event-list">
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}

      {day.commonEvents && (
        <section className="cinema-page-section">
          <div className="cinema-section-label">
            <span>家族合流後</span>
            <i />
          </div>
          <div className="cinema-event-list">
            {day.commonEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
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
            {day.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {day.undecided && (
        <section className="cinema-pending-card">
          <p>TO BE DECIDED</p>
          <h2>検討中</h2>
          <ul>
            {day.undecided.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

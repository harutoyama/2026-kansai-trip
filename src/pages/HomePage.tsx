import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScenicBackdrop } from "../components/ScenicBackdrop";
import { tripDays } from "../data/trip";
import { dayEvents, formatRemaining, getScheduleState } from "../lib/schedule";
import type { ScheduleState } from "../lib/schedule";
import type { TripEvent, WeatherSnapshot } from "../types";

const city = {
  label: "大阪（予定地点）",
  latitude: 34.6937,
  longitude: 135.5023,
};
const codeLabel = (code: number) =>
  code === 0
    ? "快晴"
    : code <= 3
      ? "晴れ・くもり"
      : code <= 67
        ? "雨"
        : code <= 77
          ? "雪"
          : "雨・雷の可能性";

async function fetchWeather(
  latitude: number,
  longitude: number,
  label: string,
): Promise<WeatherSnapshot> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,weather_code,precipitation_probability",
  );
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", "Asia/Tokyo");
  const response = await fetch(url);
  if (!response.ok) throw new Error("天気を取得できませんでした");
  const data = await response.json();
  return {
    label,
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    precipitationProbability: data.current.precipitation_probability,
    high: data.daily.temperature_2m_max[0],
    low: data.daily.temperature_2m_min[0],
  };
}

function displayedEvent(state: ScheduleState): TripEvent | undefined {
  if (state.kind === "active") return state.current;
  if (state.kind === "before_trip" || state.kind === "between")
    return state.next;
  return undefined;
}

function stateTitle(state: ScheduleState) {
  if (state.kind === "active") return state.current.title;
  if (state.kind === "before_trip") return state.next.title;
  if (state.kind === "between") return state.next.title;
  if (state.kind === "day_finished") return "本日の予定は終了しました";
  if (state.kind === "trip_finished") return "家族旅行は終了しました";
  return "本日の予定はありません";
}

function stateLabel(state: ScheduleState) {
  if (state.kind === "active") return "NOW / 今やること";
  if (state.kind === "before_trip") return "NEXT / 旅の始まり";
  if (state.kind === "between") return "NEXT / 次にやること";
  return "TRIP STATUS / 現在の状況";
}

function countdownLabel(state: ScheduleState, now: Date) {
  const target =
    state.kind === "before_trip" || state.kind === "between"
      ? state.startsAt
      : state.kind === "active" && state.nextStartsAt
        ? state.nextStartsAt
        : null;
  if (!target) return null;
  const minutes = Math.max(
    0,
    Math.ceil((target.getTime() - now.getTime()) / 60000),
  );
  if (minutes >= 2880) return `あと${Math.ceil(minutes / 1440)}日`;
  return `あと${formatRemaining(target, now)}`;
}

function splitRoute(location?: string) {
  const parts =
    location
      ?.split("→")
      .map((part) => part.trim())
      .filter(Boolean) ?? [];
  if (parts.length >= 2) return [parts[0], parts.at(-1) ?? "目的地"] as const;
  return [location ?? "関西の旅", "次の目的地"] as const;
}

export function HomePage() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherSnapshot[]>([]);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const currentTripDayIndex = tripDays.findIndex((day) => day.date === dateKey);
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    Math.max(0, currentTripDayIndex),
  );

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const state = useMemo(() => getScheduleState(tripDays, now), [now]);
  const current = displayedEvent(state);
  const countdown = countdownLabel(state, now);
  const selectedDay = tripDays[selectedDayIndex] ?? tripDays[0];
  const selectedEvents = selectedDay ? dayEvents(selectedDay).slice(0, 3) : [];
  const [routeStart, routeEnd] = splitRoute(current?.location);

  const loadPlanned = async () => {
    setLoading(true);
    setWeatherError(null);
    try {
      setWeather([
        await fetchWeather(city.latitude, city.longitude, city.label),
      ]);
    } catch (error) {
      setWeatherError(
        error instanceof Error ? error.message : "天気取得エラー",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlanned();
  }, []);

  const loadCurrent = () => {
    if (!navigator.geolocation) {
      setWeatherError("位置情報に対応していません");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const currentWeather = await fetchWeather(
            position.coords.latitude,
            position.coords.longitude,
            "現在地",
          );
          const planned = await fetchWeather(
            city.latitude,
            city.longitude,
            city.label,
          );
          setWeather([currentWeather, planned]);
          setWeatherError(null);
        } catch (error) {
          setWeatherError(
            error instanceof Error ? error.message : "天気取得エラー",
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        setWeatherError(
          "位置情報を取得できませんでした。旅程はそのまま利用できます。",
        );
        setLoading(false);
      },
      { timeout: 8000 },
    );
  };

  const mapQuery = current?.mapsQuery ?? current?.location ?? current?.title;
  const mapUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;
  const todayLabel = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(now);

  return (
    <div className="cinema-home">
      <header className="cinema-hero">
        <ScenicBackdrop />
        <div className="cinema-hero-overlay" />
        <div className="cinema-hero-top">
          <p className="cinema-wordmark">Kansai Journal</p>
          <p className="cinema-trip-length">5泊6日</p>
        </div>
        <div className="cinema-hero-copy">
          <p className="cinema-eyebrow">20–25 August 2026</p>
          <h1>
            夏の景色へ、
            <br />
            家族で出発する。
          </h1>
        </div>
        <div className="cinema-destination-list" aria-label="主な旅行先">
          <span>大阪</span>
          <span>京都</span>
          <span>岡山</span>
        </div>
      </header>

      <div className="cinema-home-content">
        <section className="cinema-now-card" aria-labelledby="now-title">
          <div className="cinema-now-meta">
            <p>{stateLabel(state)}</p>
            {countdown && <span>{countdown}</span>}
          </div>
          <h2 id="now-title">{stateTitle(state)}</h2>

          {current && (
            <>
              <div className="cinema-platform-board">
                <div>
                  <small>START</small>
                  <strong>{current.start ?? "未定"}</strong>
                </div>
                <div className="cinema-board-route" aria-hidden="true" />
                <div>
                  <small>END</small>
                  <strong>{current.end ?? "未定"}</strong>
                </div>
              </div>
              <div className="cinema-service-row">
                <p>
                  <strong>{routeStart}</strong>
                  <span>から</span>
                  <strong>{routeEnd}</strong>
                </p>
                <span className={`cinema-certainty is-${current.certainty}`}>
                  {current.certainty === "confirmed"
                    ? "確定"
                    : current.certainty === "candidate"
                      ? "候補"
                      : "未定"}
                </span>
              </div>
              {mapUrl && (
                <a
                  className="cinema-primary-action"
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  場所と移動ルートを確認する
                </a>
              )}
            </>
          )}
        </section>

        <div
          className="cinema-day-strip"
          role="tablist"
          aria-label="旅行日を選択"
        >
          {tripDays.map((day, index) => {
            const date = new Date(`${day.date}T00:00:00+09:00`);
            const weekday = new Intl.DateTimeFormat("en-US", {
              weekday: "short",
              timeZone: "Asia/Tokyo",
            })
              .format(date)
              .toUpperCase();
            return (
              <button
                type="button"
                role="tab"
                aria-selected={selectedDayIndex === index}
                className={selectedDayIndex === index ? "is-active" : ""}
                key={day.date}
                onClick={() => setSelectedDayIndex(index)}
              >
                <span>{weekday}</span>
                <strong>{Number(day.date.slice(-2))}</strong>
              </button>
            );
          })}
        </div>

        <div className="cinema-section-head">
          <div>
            <p>{selectedDay?.area}</p>
            <h2>{selectedDay?.dayNumber}日目の旅程</h2>
          </div>
          <Link to="/itinerary">全旅程</Link>
        </div>

        <div className="cinema-journey-list">
          {selectedEvents.map((event) => {
            const [start, end] = splitRoute(event.location);
            return (
              <article className="cinema-journey-card" key={event.id}>
                <div className="cinema-journey-top">
                  <strong>{event.start ?? "未定"}</strong>
                  <span>
                    {event.certainty === "confirmed"
                      ? "CONFIRMED"
                      : event.certainty === "candidate"
                        ? "PLANNING"
                        : "UNDECIDED"}
                  </span>
                </div>
                <h3>{event.title}</h3>
                <div className="cinema-mini-route">
                  <b>{start}</b>
                  <i aria-hidden="true" />
                  <b>{end}</b>
                </div>
                {event.description && <p>{event.description}</p>}
              </article>
            );
          })}
        </div>

        <div className="cinema-section-head cinema-weather-heading">
          <div>
            <p>{todayLabel}</p>
            <h2>旅のコンディション</h2>
          </div>
          <button type="button" onClick={loadCurrent} disabled={loading}>
            {loading ? "取得中" : "現在地も取得"}
          </button>
        </div>
        {weatherError && (
          <p className="cinema-alert" role="status">
            {weatherError}
          </p>
        )}
        <div className="cinema-info-grid">
          {weather.map((item) => (
            <article className="cinema-weather-card" key={item.label}>
              <div className="cinema-weather-orbit" aria-hidden="true" />
              <small>{item.label}</small>
              <strong>{Math.round(item.temperature)}°C</strong>
              <p>
                {codeLabel(item.weatherCode)}
                <br />
                最高{Math.round(item.high ?? item.temperature)}° / 最低
                {Math.round(item.low ?? item.temperature)}°
              </p>
              <span>降水確率 {item.precipitationProbability ?? 0}%</span>
            </article>
          ))}
          <article className="cinema-trip-card">
            <small>FAMILY JOURNEY</small>
            <strong>4</strong>
            <p>
              家族4人で巡る
              <br />
              関西5泊6日
            </p>
            <span>大阪・京都・岡山</span>
          </article>
        </div>
      </div>
    </div>
  );
}

import { Clock3, CloudSun, MapPinned, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EventCard } from '../components/EventCard'
import { tripDays } from '../data/trip'
import { dayEvents, formatRemaining, getScheduleState } from '../lib/schedule'
import type { WeatherSnapshot } from '../types'

const city = { label: '大阪（予定地点）', latitude: 34.6937, longitude: 135.5023 }
const codeLabel = (code: number) => code === 0 ? '快晴' : code <= 3 ? '晴れ・くもり' : code <= 67 ? '雨' : code <= 77 ? '雪' : '雨・雷の可能性'

async function fetchWeather(latitude: number, longitude: number, label: string): Promise<WeatherSnapshot> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('current', 'temperature_2m,weather_code,precipitation_probability')
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min')
  url.searchParams.set('timezone', 'Asia/Tokyo')
  const response = await fetch(url)
  if (!response.ok) throw new Error('天気を取得できませんでした')
  const data = await response.json()
  return {
    label,
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    precipitationProbability: data.current.precipitation_probability,
    high: data.daily.temperature_2m_max[0],
    low: data.daily.temperature_2m_min[0],
  }
}

export function HomePage() {
  const [now, setNow] = useState(new Date())
  const [weather, setWeather] = useState<WeatherSnapshot[]>([])
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const state = useMemo(() => getScheduleState(tripDays, now), [now])
  const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const today = tripDays.find(d => d.date === dateKey)

  const loadPlanned = async () => {
    setLoading(true)
    setWeatherError(null)
    try {
      setWeather([await fetchWeather(city.latitude, city.longitude, city.label)])
    } catch (e) {
      setWeatherError(e instanceof Error ? e.message : '天気取得エラー')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadPlanned() }, [])

  const loadCurrent = () => {
    if (!navigator.geolocation) return setWeatherError('位置情報に対応していません')
    setLoading(true)
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const currentWeather = await fetchWeather(pos.coords.latitude, pos.coords.longitude, '現在地')
        const planned = await fetchWeather(city.latitude, city.longitude, city.label)
        setWeather([currentWeather, planned])
        setWeatherError(null)
      } catch (e) {
        setWeatherError(e instanceof Error ? e.message : '天気取得エラー')
      } finally {
        setLoading(false)
      }
    }, () => {
      setWeatherError('位置情報を取得できませんでした。旅程はそのまま利用できます。')
      setLoading(false)
    }, { timeout: 8000 })
  }

  const current = state.kind === 'active' ? state.current : state.kind === 'before_trip' || state.kind === 'between' ? state.next : undefined

  return <div className="space-y-5">
    <header>
      <p className="text-sm font-bold text-sky-700">2026年夏・家族4人関西旅行</p>
      <h1 className="mt-1 text-2xl font-black">ホーム</h1>
      <p className="mt-2 text-slate-600">{new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'full', timeStyle: 'short' }).format(now)}{today ? ` · 旅行${today.dayNumber}日目` : ''}</p>
    </header>
    <section className="rounded-3xl bg-gradient-to-br from-sky-700 to-cyan-500 p-5 text-white shadow-lg">
      <p className="text-sm font-bold opacity-90">今やること</p>
      <h2 className="mt-2 text-2xl font-black">{state.kind === 'active' ? state.current.title : state.kind === 'before_trip' ? '旅行開始前' : state.kind === 'between' ? '次の予定まで待機' : state.kind === 'day_finished' ? '本日の予定は終了' : state.kind === 'trip_finished' ? '旅行は終了しました' : '本日の予定なし'}</h2>
      {state.kind === 'before_trip' || state.kind === 'between'
        ? <p className="mt-3 flex items-center gap-2"><Clock3 size={18} />{state.next.title}まで {formatRemaining(state.startsAt, now)}</p>
        : state.kind === 'active' && state.next && state.nextStartsAt
          ? <p className="mt-3">次: {state.next.title}（あと{formatRemaining(state.nextStartsAt, now)}）</p>
          : null}
    </section>
    {current && <section><h2 className="section-title">現在・次の予定</h2><EventCard event={current} /></section>}
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title mb-0">天気</h2>
        <button onClick={loadCurrent} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm font-bold"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />現在地も取得</button>
      </div>
      {weatherError && <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{weatherError}</p>}
      <div className="grid gap-3 sm:grid-cols-2">{weather.map(w => <article className="card" key={w.label}>
        <div className="flex items-center gap-2 text-sky-700"><CloudSun /><h3 className="font-bold">{w.label}</h3></div>
        <p className="mt-3 text-3xl font-black">{Math.round(w.temperature)}℃</p>
        <p className="mt-1 text-sm text-slate-600">{codeLabel(w.weatherCode)} · 最高{Math.round(w.high ?? w.temperature)}℃ / 最低{Math.round(w.low ?? w.temperature)}℃</p>
        <p className="mt-1 text-sm text-slate-600">降水確率 {w.precipitationProbability ?? 0}%</p>
      </article>)}</div>
    </section>
    {today && <section><h2 className="section-title">今日のタイムライン</h2><div className="space-y-3">{dayEvents(today).map(e => <EventCard key={e.id} event={e} />)}</div></section>}
    <section className="card"><div className="flex items-center gap-2 text-sky-700"><MapPinned /><h2 className="font-bold">旅行期間</h2></div><p className="mt-2 text-sm text-slate-600">2026年8月20日（木）〜8月25日（火）・5泊6日</p></section>
  </div>
}

import type { TripDay, TripEvent } from '../types'

export const JST_TIME_ZONE = 'Asia/Tokyo'

export function eventDateTime(date: string, time?: string): Date | null {
  if (!time) return null
  return new Date(`${date}T${time}:00+09:00`)
}

export function dayEvents(day: TripDay): TripEvent[] {
  return [
    ...(day.groups?.flatMap((group) => group.events) ?? []),
    ...(day.commonEvents ?? []),
    ...(day.events ?? [])
  ].sort((a, b) => (a.start ?? '99:99').localeCompare(b.start ?? '99:99'))
}

export type ScheduleState =
  | { kind: 'before_trip'; next: TripEvent; startsAt: Date }
  | { kind: 'active'; current: TripEvent; next?: TripEvent; nextStartsAt?: Date }
  | { kind: 'between'; next: TripEvent; startsAt: Date }
  | { kind: 'day_finished' }
  | { kind: 'trip_finished' }
  | { kind: 'no_events' }

export function getScheduleState(days: TripDay[], now: Date): ScheduleState {
  const firstDay = days[0]
  const lastDay = days.at(-1)
  if (!firstDay || !lastDay) return { kind: 'no_events' }

  const firstEvent = dayEvents(firstDay).find((event) => event.start)
  const firstStart = firstEvent ? eventDateTime(firstDay.date, firstEvent.start) : null
  if (firstEvent && firstStart && now < firstStart) {
    return { kind: 'before_trip', next: firstEvent, startsAt: firstStart }
  }

  const tripEnd = new Date(`${lastDay.date}T23:59:59+09:00`)
  if (now > tripEnd) return { kind: 'trip_finished' }

  const dateKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: JST_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(now)
  const day = days.find((item) => item.date === dateKey)
  if (!day) return { kind: 'no_events' }

  const events = dayEvents(day).filter((event) => event.start)
  for (let index = 0; index < events.length; index += 1) {
    const event = events[index]
    const start = eventDateTime(day.date, event.start)
    const end = eventDateTime(day.date, event.end ?? event.start)
    if (!start || !end) continue
    if (now >= start && now <= end) {
      const next = events[index + 1]
      return {
        kind: 'active', current: event, next,
        nextStartsAt: next ? eventDateTime(day.date, next.start) ?? undefined : undefined
      }
    }
    if (now < start) return { kind: 'between', next: event, startsAt: start }
  }
  return { kind: 'day_finished' }
}

export function formatRemaining(target: Date, now: Date): string {
  const minutes = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 60000))
  if (minutes < 60) return `${minutes}分`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours}時間${rest}分` : `${hours}時間`
}

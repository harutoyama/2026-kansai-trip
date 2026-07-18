export type EventStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'
export type Certainty = 'confirmed' | 'candidate' | 'undecided'

export interface TripEvent {
  id: string
  title: string
  start?: string
  end?: string
  location?: string
  certainty: Certainty
  description?: string
  mapsQuery?: string
}

export interface TripGroup {
  id: string
  label: string
  members?: string[]
  events: TripEvent[]
}

export interface TripDay {
  date: string
  dayNumber: number
  summary: string
  area: string
  accommodation?: string
  groups?: TripGroup[]
  commonEvents?: TripEvent[]
  events?: TripEvent[]
  undecided?: string[]
}

export interface ProgressRecord {
  event_id: string
  status: EventStatus
  actual_start_at?: string | null
  actual_end_at?: string | null
  delay_minutes: number
  note: string
  updated_at?: string
}

export interface WeatherSnapshot {
  label: string
  temperature: number
  weatherCode: number
  precipitationProbability?: number
  high?: number
  low?: number
}

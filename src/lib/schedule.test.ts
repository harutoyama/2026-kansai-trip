import { describe, expect, it } from 'vitest'
import { getScheduleState } from './schedule'
import { tripDays } from '../data/trip'

describe('getScheduleState', () => {
  it('旅行前を判定する', () => {
    const state = getScheduleState(tripDays, new Date('2026-08-19T12:00:00+09:00'))
    expect(state.kind).toBe('before_trip')
  })

  it('予定実行中を判定する', () => {
    const state = getScheduleState(tripDays, new Date('2026-08-20T14:30:00+09:00'))
    expect(state.kind).toBe('active')
  })

  it('旅行終了後を判定する', () => {
    const state = getScheduleState(tripDays, new Date('2026-08-26T09:00:00+09:00'))
    expect(state.kind).toBe('trip_finished')
  })
})

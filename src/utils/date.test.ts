import { describe, expect, it } from 'vitest'
import { formatJapaneseWeekday } from './date'

describe('formatJapaneseWeekday', () => {
  it('formats every travel date in Japan time', () => {
    expect([
      formatJapaneseWeekday('2026-08-20'),
      formatJapaneseWeekday('2026-08-21'),
      formatJapaneseWeekday('2026-08-22'),
      formatJapaneseWeekday('2026-08-23'),
      formatJapaneseWeekday('2026-08-24'),
      formatJapaneseWeekday('2026-08-25')
    ]).toEqual(['木曜日', '金曜日', '土曜日', '日曜日', '月曜日', '火曜日'])
  })
})

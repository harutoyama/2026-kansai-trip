import { describe, expect, it } from 'vitest'
import { allEvents, tripDays, tripStays } from './trip'

function event(id: string) {
  const found = allEvents.find((item) => item.id === id)
  if (!found) throw new Error(`event not found: ${id}`)
  return found
}

describe('2026 Kansai trip canonical data', () => {
  it('stores the exact August 20 group split and common start time', () => {
    const day = tripDays.find((item) => item.date === '2026-08-20')
    expect(day?.groups?.map((group) => group.id)).toEqual(['haru', 'family-three'])
    expect(day?.commonEvents?.[0].start).toBe('11:20')
  })

  it('stores confirmed train times, platforms and seats', () => {
    expect(event('20260820-haru-nozomi129').transport).toMatchObject({
      service: 'のぞみ129号',
      departure: { time: '08:39', platform: '18番線' },
      arrival: { time: '11:06', platform: '21番線' },
      seats: [{ passenger: '晴', car: '14号車', seat: '7E' }]
    })

    expect(event('20260820-family-haruka14').transport?.seats?.map((seat) => `${seat.car}-${seat.seat}`)).toEqual([
      '4号車-5A', '4号車-5B', '4号車-5C'
    ])

    expect(event('20260820-family-sakura753').transport?.seats?.map((seat) => `${seat.car}-${seat.seat}`)).toEqual([
      '5号車-7C', '5号車-7D', '5号車-8C', '5号車-8D'
    ])

    expect(event('20260820-family-nozomi52').transport).toMatchObject({
      departure: { time: '18:40', platform: '23番線' },
      arrival: { time: '19:28', platform: '26番線' }
    })
    expect(event('20260820-family-nozomi52').transport?.seats?.map((seat) => seat.seat)).toEqual(['4D', '4E', '5D', '5E'])
  })

  it('stores the outbound and return flights', () => {
    expect(event('20260820-family-nu002').transport).toMatchObject({
      service: 'NU002便',
      departure: { name: '那覇空港', time: '07:10' },
      arrival: { name: '関西国際空港', time: '09:10' }
    })
    expect(event('20260825-family-jal2085').transport).toMatchObject({
      service: 'JAL2085便',
      departure: { name: '大阪国際空港（伊丹）', time: '13:10' },
      arrival: { name: '那覇空港', time: '15:15' }
    })
  })

  it('keeps station-only and transport events free of map links', () => {
    const transportEvents = allEvents.filter((item) => item.transport)
    expect(transportEvents.every((item) => item.showMap === false && !item.mapsQuery)).toBe(true)
  })

  it('stores hotel dates and addresses', () => {
    expect(tripStays).toEqual([
      expect.objectContaining({
        name: '相鉄フレッサイン 北浜',
        nights: 3,
        address: '〒541-0043 大阪府大阪市中央区高麗橋2丁目4-10'
      }),
      expect.objectContaining({ nights: 2, address: '〒554-0024 大阪府大阪市此花区島屋6丁目2-78' })
    ])
  })

  it('stores place addresses in expandable details instead of descriptions', () => {
    expect(event('20260820-hotel-checkin').details).toEqual([
      { label: '住所', value: '〒541-0043 大阪府大阪市中央区高麗橋2丁目4-10' }
    ])
    expect(event('20260822-conan-escape').details?.[0]?.label).toBe('住所')
    expect(event('20260823-luggage').details?.[0]?.label).toBe('住所')

    const placeEvents = [
      event('20260820-hotel-checkin'),
      event('20260822-conan-escape'),
      event('20260823-luggage')
    ]
    expect(placeEvents.every((item) => !item.description?.includes('〒'))).toBe(true)
  })

  it('stores the fixed activities', () => {
    expect(event('20260822-conan-escape')).toMatchObject({ start: '10:00', certainty: 'confirmed' })
    expect(event('20260823-usj-half-day')).toMatchObject({ start: '15:00', certainty: 'confirmed' })
    expect(event('20260824-usj-full-day')).toMatchObject({ start: '08:00', certainty: 'confirmed' })
  })
})

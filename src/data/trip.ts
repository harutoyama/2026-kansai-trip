import type { TripDay } from '../types'

export const tripDays: TripDay[] = [
  {
    date: '2026-08-20',
    dayNumber: 1,
    summary: '東京・沖縄から岡山へ集合し、大阪へ移動',
    area: '東京・関西空港・岡山・大阪',
    accommodation: '相鉄フレッサイン 淀屋橋周辺',
    groups: [
      {
        id: 'haru',
        label: 'Haru',
        events: [
          { id: '20260820-haru-depart', title: '東京駅へ移動', start: '06:30', end: '07:15', location: '東京駅', certainty: 'candidate', mapsQuery: '東京駅' },
          { id: '20260820-haru-train', title: '新幹線で岡山へ', start: '07:30', end: '11:00', location: '東京駅 → 岡山駅', certainty: 'candidate', description: '購入後に列車時刻を確定する。', mapsQuery: '岡山駅' }
        ]
      },
      {
        id: 'okinawa-group',
        label: '沖縄組',
        members: ['父', '母', '弟'],
        events: [
          { id: '20260820-okinawa-flight', title: '沖縄から関西国際空港へ', start: '07:00', end: '09:30', location: '那覇空港 → 関西国際空港', certainty: 'candidate', mapsQuery: '関西国際空港' },
          { id: '20260820-kix-okayama', title: '関西国際空港から岡山へ', start: '10:00', end: '13:30', location: '関西国際空港 → 岡山駅', certainty: 'candidate', mapsQuery: '岡山駅' }
        ]
      }
    ],
    commonEvents: [
      { id: '20260820-family-meet', title: '岡山で家族合流', start: '13:30', end: '14:00', location: '岡山駅', certainty: 'candidate', mapsQuery: '岡山駅' },
      { id: '20260820-relative-visit', title: '母方親族と面会', start: '14:00', end: '17:00', location: '岡山市周辺', certainty: 'confirmed', description: '詳細な住所などの機微情報は掲載しない。', mapsQuery: '岡山駅' },
      { id: '20260820-okayama-osaka', title: '岡山から大阪へ移動', start: '17:30', end: '19:30', location: '岡山駅 → 新大阪駅', certainty: 'candidate', mapsQuery: '新大阪駅' },
      { id: '20260820-hotel', title: 'ホテルへチェックイン', start: '20:00', end: '20:30', location: '淀屋橋周辺', certainty: 'confirmed', mapsQuery: '相鉄フレッサイン 淀屋橋' }
    ],
    undecided: ['新幹線・航空便の確定時刻', '岡山での具体的な集合地点']
  },
  {
    date: '2026-08-21',
    dayNumber: 2,
    summary: '大阪市内をゆっくり観光',
    area: '大阪',
    accommodation: '相鉄フレッサイン 淀屋橋周辺',
    events: [
      { id: '20260821-breakfast', title: '朝食・出発準備', start: '08:00', end: '09:30', location: '淀屋橋周辺', certainty: 'candidate', mapsQuery: '淀屋橋駅' },
      { id: '20260821-sightseeing', title: '大阪市内観光', start: '10:00', end: '16:30', location: '大阪市内', certainty: 'undecided', description: '訪問先は家族で検討中。', mapsQuery: '大阪駅' },
      { id: '20260821-dinner', title: '夕食', start: '18:00', end: '20:00', location: '大阪市内', certainty: 'candidate', mapsQuery: '淀屋橋駅 レストラン' }
    ],
    undecided: ['観光地', '昼食・夕食の店舗']
  },
  {
    date: '2026-08-22',
    dayNumber: 3,
    summary: '関西エリアの日帰り観光',
    area: '大阪・京都・兵庫候補',
    accommodation: '相鉄フレッサイン 淀屋橋周辺',
    events: [
      { id: '20260822-daytrip', title: '関西日帰り観光', start: '09:00', end: '18:00', location: '行き先検討中', certainty: 'undecided', mapsQuery: '大阪駅' },
      { id: '20260822-dinner', title: 'ホテル周辺で夕食', start: '19:00', end: '20:30', location: '淀屋橋周辺', certainty: 'candidate', mapsQuery: '淀屋橋駅 レストラン' }
    ],
    undecided: ['日帰り観光の行き先']
  },
  {
    date: '2026-08-23',
    dayNumber: 4,
    summary: '淀屋橋からUSJ周辺へ移動',
    area: '大阪・ユニバーサルシティ',
    accommodation: 'オリエンタルホテル USJ周辺',
    events: [
      { id: '20260823-checkout', title: 'ホテルをチェックアウト', start: '09:00', end: '10:00', location: '淀屋橋周辺', certainty: 'confirmed', mapsQuery: '淀屋橋駅' },
      { id: '20260823-transfer', title: 'USJ周辺へ移動', start: '10:00', end: '11:30', location: '淀屋橋 → ユニバーサルシティ', certainty: 'candidate', mapsQuery: 'ユニバーサルシティ駅' },
      { id: '20260823-luggage', title: 'ホテルへ荷物を預ける', start: '11:30', end: '12:00', location: 'USJ周辺', certainty: 'confirmed', mapsQuery: 'オリエンタルホテル ユニバーサル・シティ' },
      { id: '20260823-afternoon', title: 'USJ周辺観光', start: '12:00', end: '18:00', location: 'ユニバーサルシティ', certainty: 'candidate', mapsQuery: 'ユニバーサル・シティウォーク大阪' }
    ]
  },
  {
    date: '2026-08-24',
    dayNumber: 5,
    summary: 'USJまたは周辺観光',
    area: 'ユニバーサルシティ',
    accommodation: 'オリエンタルホテル USJ周辺',
    events: [
      { id: '20260824-usj', title: 'USJまたは周辺観光', start: '08:00', end: '20:00', location: 'USJ周辺', certainty: 'candidate', mapsQuery: 'ユニバーサル・スタジオ・ジャパン' }
    ],
    undecided: ['USJ入園の有無', 'チケット・レストラン']
  },
  {
    date: '2026-08-25',
    dayNumber: 6,
    summary: '家族4人で沖縄へ帰る',
    area: '大阪・関西空港・沖縄',
    events: [
      { id: '20260825-checkout', title: 'ホテルをチェックアウト', start: '08:00', end: '09:00', location: 'USJ周辺', certainty: 'confirmed', mapsQuery: 'ユニバーサルシティ駅' },
      { id: '20260825-kix', title: '関西国際空港へ移動', start: '09:00', end: '11:00', location: 'ユニバーサルシティ → 関西国際空港', certainty: 'candidate', mapsQuery: '関西国際空港' },
      { id: '20260825-flight', title: '沖縄へ帰る', start: '12:00', end: '15:00', location: '関西国際空港 → 那覇空港', certainty: 'candidate', mapsQuery: '那覇空港' }
    ],
    undecided: ['帰りの航空便時刻']
  }
]

export const allEvents = tripDays.flatMap((day) => [
  ...(day.groups?.flatMap((group) => group.events) ?? []),
  ...(day.commonEvents ?? []),
  ...(day.events ?? [])
])

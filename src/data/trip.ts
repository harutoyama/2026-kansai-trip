import type { TripDay, TripEvent, TransportDetail } from '../types'

function transportEvent(
  event: Omit<TripEvent, 'start' | 'end' | 'location' | 'transport'> & {
    transport: TransportDetail
  }
): TripEvent {
  const { transport, ...base } = event
  return {
    ...base,
    start: transport.departure.time,
    end: transport.arrival.time,
    location: `${transport.departure.name} → ${transport.arrival.name}`,
    showMap: false,
    transport
  }
}

export const tripDays: TripDay[] = [
  {
    date: '2026-08-20',
    dayNumber: 1,
    summary: '東京・沖縄から新大阪で合流し、岡山往復後に淀屋橋へ',
    area: '東京・関西空港・新大阪・岡山・西大寺・大阪',
    accommodation: '相鉄フレッサイン 淀屋橋（1泊目／3泊）',
    groups: [
      {
        id: 'haru',
        label: '晴',
        events: [
          transportEvent({
            id: '20260820-haru-higashikoganei-tokyo',
            title: '東小金井駅から東京駅へ',
            certainty: 'confirmed',
            description: '東京駅での乗換は9分。中央線ホームから東海道新幹線18番線へ直行する。実務上は一本以上早い中央線を推奨。',
            transport: {
              mode: 'rail',
              operator: 'JR東日本',
              service: '中央線快速',
              line: '中央本線・中央線快速（東京方面）',
              departure: { name: '東小金井', time: '07:48', platform: '1番線が基本' },
              arrival: { name: '東京', time: '08:30', platform: '中央線1・2番線のいずれか', note: '当日の発車標で確認' },
              notes: ['東京8:39発の新幹線まで9分', '切符を事前に用意し、途中で立ち止まらず移動する']
            }
          }),
          transportEvent({
            id: '20260820-haru-nozomi129',
            title: 'のぞみ129号で新大阪へ',
            certainty: 'confirmed',
            transport: {
              mode: 'shinkansen',
              operator: 'JR東海・JR西日本',
              service: 'のぞみ129号',
              serviceCode: '129A',
              line: '東海道・山陽新幹線',
              departure: { name: '東京', time: '08:39', platform: '18番線' },
              arrival: { name: '新大阪', time: '11:06', platform: '21番線' },
              equipment: 'N700系',
              stops: ['品川', '新横浜', '名古屋', '京都', '新大阪'],
              seats: [{ passenger: '晴', car: '14号車', seat: '7E' }],
              notes: ['新大阪到着後は改札を出ず、20番線へ移動する']
            }
          })
        ]
      },
      {
        id: 'family-three',
        label: '家族3人',
        members: ['父', '母', '弟'],
        events: [
          transportEvent({
            id: '20260820-family-nu002',
            title: 'NU002便で関西空港へ',
            certainty: 'confirmed',
            description: '搭乗口・到着口・手荷物受取所は当日確定。JALアプリと空港案内表示で確認する。',
            transport: {
              mode: 'flight',
              operator: '日本トランスオーシャン航空（JTA）',
              service: 'NU002便',
              serviceCode: 'JTA002',
              line: '那覇 → 関西',
              departure: { name: '那覇空港', time: '07:10', terminal: '国内線ターミナル', platform: '搭乗口は当日確定' },
              arrival: { name: '関西国際空港', time: '09:10', terminal: '第1ターミナル', platform: '到着口は当日確定' },
              equipment: 'ボーイング737-800が基本',
              notes: ['受託手荷物受取後、2階連絡通路からJR関西空港駅へ', 'はるか14号まで66分']
            }
          }),
          {
            id: '20260820-family-kix-transfer',
            title: '手荷物受取・JR関西空港駅へ移動',
            start: '09:10',
            end: '10:00',
            location: '関西空港 第1ターミナル → JR関西空港駅',
            certainty: 'confirmed',
            description: '国内線到着口から2階連絡通路方面へ進む。10:05頃までにJR改札へ到着する目標。',
            showMap: false
          },
          transportEvent({
            id: '20260820-family-haruka14',
            title: '関空特急はるか14号で新大阪へ',
            certainty: 'confirmed',
            transport: {
              mode: 'limited-express',
              operator: 'JR西日本',
              service: '関空特急 はるか14号',
              serviceCode: '1014M',
              line: '関西空港線 → 阪和線 → 大阪環状線・梅田貨物線方面',
              departure: { name: '関西空港', time: '10:16', platform: '当日の発車標で確認' },
              arrival: { name: '新大阪', time: '11:06', platform: '在来線1番のりば' },
              equipment: '271系または281系',
              stops: ['天王寺', '大阪', '新大阪'],
              seats: [
                { passenger: '家族3人', car: '4号車', seat: '5A' },
                { passenger: '家族3人', car: '4号車', seat: '5B' },
                { passenger: '家族3人', car: '4号車', seat: '5C' }
              ],
              notes: ['新大阪では駅外へ出ず「新幹線のりかえ口」を使用', 'さくら753号まで14分。20番線の指定号車前へ直行する']
            }
          })
        ]
      }
    ],
    commonEvents: [
      transportEvent({
        id: '20260820-family-sakura753',
        title: '4人合流・さくら753号で岡山へ',
        certainty: 'confirmed',
        description: '合流場所は新大阪20番線の5号車付近。コンコースで待ち合わせない。',
        transport: {
          mode: 'shinkansen',
          operator: 'JR西日本・JR九州',
          service: 'さくら753号',
          line: '山陽新幹線',
          departure: { name: '新大阪', time: '11:20', platform: '20番線' },
          arrival: { name: '岡山', time: '12:09', platform: '22番線が基本', note: '当日の案内で確認' },
          equipment: 'N700系8両編成が基本',
          stops: ['新神戸', '姫路', '岡山'],
          seats: [
            { passenger: '晴', car: '5号車', seat: '7C' },
            { passenger: '家族3人', car: '5号車', seat: '7D' },
            { passenger: '家族3人', car: '5号車', seat: '8C' },
            { passenger: '家族3人', car: '5号車', seat: '8D' }
          ],
          notes: ['晴は21番線から20番線へ移動', '家族3人は在来線1番のりばから新幹線乗換改札を通る']
        }
      }),
      transportEvent({
        id: '20260820-family-ako-outbound',
        title: '赤穂線で西大寺へ',
        certainty: 'confirmed',
        transport: {
          mode: 'rail',
          operator: 'JR西日本',
          service: '普通列車',
          line: '赤穂線',
          departure: { name: '岡山', time: '12:41', platform: '当日の発車標で確認' },
          arrival: { name: '西大寺', time: '12:58', platform: '当日の案内で確認' },
          stops: ['高島', '東岡山', '大多羅', '西大寺'],
          notes: ['新幹線到着から32分', '発車標で「赤穂線 12:41 播州赤穂・長船方面」を確認する']
        }
      }),
      {
        id: '20260820-relative-visit',
        title: '母方親族と面会',
        start: '13:00',
        end: '17:45',
        location: '岡山市東区周辺',
        certainty: 'confirmed',
        description: '詳細な住所などの機微情報は掲載しない。17:55頃までに西大寺駅へ戻る。',
        showMap: false
      },
      transportEvent({
        id: '20260820-family-ako-return',
        title: '赤穂線で岡山へ戻る',
        certainty: 'confirmed',
        transport: {
          mode: 'rail',
          operator: 'JR西日本',
          service: '普通列車',
          line: '赤穂線',
          departure: { name: '西大寺', time: '18:08', platform: '岡山方面ホーム・当日確認' },
          arrival: { name: '岡山', time: '18:26', platform: '当日の案内で確認' },
          stops: ['大多羅', '東岡山', '高島', '岡山'],
          notes: ['のぞみ52号まで14分', '岡山到着後は買い物をせず新幹線乗換改札へ直行する']
        }
      }),
      transportEvent({
        id: '20260820-family-nozomi52',
        title: 'のぞみ52号で新大阪へ',
        certainty: 'confirmed',
        transport: {
          mode: 'shinkansen',
          operator: 'JR西日本・JR東海',
          service: 'のぞみ52号',
          serviceCode: '52A',
          line: '山陽・東海道新幹線',
          departure: { name: '岡山', time: '18:40', platform: '23番線' },
          arrival: { name: '新大阪', time: '19:28', platform: '26番線' },
          equipment: 'N700系',
          stops: ['姫路', '新神戸', '新大阪'],
          seats: [
            { passenger: '4名', car: '14号車', seat: '4D' },
            { passenger: '4名', car: '14号車', seat: '4E' },
            { passenger: '4名', car: '14号車', seat: '5D' },
            { passenger: '4名', car: '14号車', seat: '5E' }
          ],
          notes: ['岡山18:39着・18:40発', '新大阪到着後は大阪メトロ御堂筋線で淀屋橋方面へ移動']
        }
      }),
      {
        id: '20260820-family-shinosaka-yodoyabashi',
        title: '新大阪から淀屋橋へ移動',
        start: '19:40',
        end: '20:10',
        location: '新大阪 → 淀屋橋',
        certainty: 'candidate',
        description: '大阪メトロ御堂筋線を利用する想定。新幹線の遅延に応じて発車時刻を当日選ぶ。',
        showMap: false
      },
      {
        id: '20260820-hotel-checkin',
        title: '相鉄フレッサイン淀屋橋へチェックイン',
        start: '20:10',
        end: '20:40',
        location: '相鉄フレッサイン 淀屋橋',
        certainty: 'confirmed',
        description: '〒541-0041 大阪府大阪市中央区北浜3丁目2-23。8月20日から23日まで3泊。',
        mapsQuery: '相鉄フレッサイン 淀屋橋 大阪府大阪市中央区北浜3丁目2-23',
        showMap: true
      }
    ],
    undecided: ['東小金井7:48発より早い中央線へ変更するか', '当日の航空便搭乗口・到着口', '在来線の当日使用番線']
  },
  {
    date: '2026-08-21',
    dayNumber: 2,
    summary: '大阪市内をゆっくり観光',
    area: '大阪',
    accommodation: '相鉄フレッサイン 淀屋橋（2泊目／3泊）',
    events: [
      { id: '20260821-breakfast', title: '朝食・出発準備', start: '08:00', end: '09:30', location: '淀屋橋周辺', certainty: 'candidate', showMap: false },
      { id: '20260821-sightseeing', title: '大阪市内観光', start: '10:00', end: '16:30', location: '大阪市内', certainty: 'undecided', description: '訪問先は家族で検討中。', showMap: false },
      { id: '20260821-dinner', title: '夕食', start: '18:00', end: '20:00', location: '大阪市内', certainty: 'candidate', showMap: false }
    ],
    undecided: ['観光地', '昼食・夕食の店舗']
  },
  {
    date: '2026-08-22',
    dayNumber: 3,
    summary: '心斎橋でコナン脱出ゲーム、その後は大阪市内',
    area: '大阪・心斎橋',
    accommodation: '相鉄フレッサイン 淀屋橋（3泊目／3泊）',
    events: [
      {
        id: '20260822-conan-escape',
        title: 'リアル脱出ゲーム×名探偵コナン「疾風の追走からの脱出」',
        start: '10:00',
        end: '12:00',
        location: 'リアル脱出ゲーム大阪心斎橋店',
        certainty: 'confirmed',
        description: '10:00公演。9:50までの受付完了を目標とし、9:30頃に会場到着。〒542-0086 大阪府大阪市中央区西心斎橋2-11-30 ブルータスビル6F。終了時刻は進行により前後するため12:00まで確保。',
        mapsQuery: 'リアル脱出ゲーム大阪心斎橋店 大阪府大阪市中央区西心斎橋2-11-30',
        showMap: true
      },
      { id: '20260822-afternoon', title: '昼食・大阪市内散策', start: '12:30', end: '18:00', location: '心斎橋・大阪市内', certainty: 'candidate', showMap: false },
      { id: '20260822-dinner', title: 'ホテル周辺で夕食', start: '19:00', end: '20:30', location: '淀屋橋周辺', certainty: 'candidate', showMap: false }
    ],
    undecided: ['脱出ゲーム後の昼食・午後の訪問先']
  },
  {
    date: '2026-08-23',
    dayNumber: 4,
    summary: '淀屋橋からユニバーサルシティへ移動し、15時からUSJ',
    area: '大阪・ユニバーサルシティ',
    accommodation: 'オリエンタルホテル ユニバーサル・シティ（1泊目／2泊）',
    events: [
      { id: '20260823-checkout', title: '相鉄フレッサインをチェックアウト', start: '09:00', end: '10:00', location: '相鉄フレッサイン 淀屋橋', certainty: 'confirmed', mapsQuery: '相鉄フレッサイン 淀屋橋 大阪府大阪市中央区北浜3丁目2-23', showMap: true },
      { id: '20260823-transfer', title: 'ユニバーサルシティへ移動', start: '10:00', end: '11:30', location: '淀屋橋 → ユニバーサルシティ', certainty: 'candidate', description: '当日の列車時刻は出発時に選ぶ。駅だけのGoogleマップリンクは表示しない。', showMap: false },
      {
        id: '20260823-luggage',
        title: 'オリエンタルホテルへ荷物を預ける',
        start: '11:30',
        end: '12:00',
        location: 'オリエンタルホテル ユニバーサル・シティ',
        certainty: 'confirmed',
        description: '〒554-0024 大阪府大阪市此花区島屋6丁目2-78。8月23日から25日まで2泊。',
        mapsQuery: 'オリエンタルホテル ユニバーサル・シティ 大阪府大阪市此花区島屋6丁目2-78',
        showMap: true
      },
      { id: '20260823-lunch', title: '昼食・入園準備', start: '12:00', end: '14:30', location: 'ユニバーサルシティ周辺', certainty: 'candidate', showMap: false },
      {
        id: '20260823-usj-half-day',
        title: 'USJ 0.5日入園',
        start: '15:00',
        location: 'ユニバーサル・スタジオ・ジャパン',
        certainty: 'confirmed',
        description: '15:00入園。終了は当日の営業時間・体力・混雑状況に合わせる。24日の1日分と合わせて1.5日利用する。',
        mapsQuery: 'ユニバーサル・スタジオ・ジャパン',
        showMap: true
      }
    ]
  },
  {
    date: '2026-08-24',
    dayNumber: 5,
    summary: '朝一番からUSJを1日利用',
    area: 'ユニバーサルシティ',
    accommodation: 'オリエンタルホテル ユニバーサル・シティ（2泊目／2泊）',
    events: [
      {
        id: '20260824-usj-full-day',
        title: 'USJ 1日入園',
        start: '08:00',
        location: 'ユニバーサル・スタジオ・ジャパン',
        certainty: 'confirmed',
        description: '朝一番から入園する方針。公式営業時間は変更され得るため、前日と当日に公式アプリで開園時刻を再確認し、開園前到着を目標とする。23日分と合わせて1.5日利用。',
        mapsQuery: 'ユニバーサル・スタジオ・ジャパン',
        showMap: true
      }
    ],
    undecided: ['当日の公式開園・閉園時刻', 'エクスプレス・パス対象アトラクションの回り方']
  },
  {
    date: '2026-08-25',
    dayNumber: 6,
    summary: '家族4人で伊丹空港から沖縄へ帰る',
    area: 'ユニバーサルシティ・大阪伊丹空港・沖縄',
    events: [
      {
        id: '20260825-checkout',
        title: 'オリエンタルホテルをチェックアウト',
        start: '08:00',
        end: '09:00',
        location: 'オリエンタルホテル ユニバーサル・シティ',
        certainty: 'confirmed',
        mapsQuery: 'オリエンタルホテル ユニバーサル・シティ 大阪府大阪市此花区島屋6丁目2-78',
        showMap: true
      },
      { id: '20260825-itami-transfer', title: '大阪伊丹空港へ移動', start: '09:00', end: '11:30', location: 'ユニバーサルシティ → 大阪伊丹空港', certainty: 'candidate', description: '利用交通と具体的な発車時刻は別途確定する。11:30頃までの空港到着を目標とする。', showMap: false },
      transportEvent({
        id: '20260825-family-jal2085',
        title: 'JAL2085便で那覇へ',
        certainty: 'confirmed',
        description: '4名一緒に搭乗。搭乗口・到着口は当日JALアプリと空港案内表示で確認する。',
        transport: {
          mode: 'flight',
          operator: '日本航空（JAL）',
          service: 'JAL2085便',
          line: '大阪（伊丹） → 沖縄（那覇）',
          departure: { name: '大阪国際空港（伊丹）', time: '13:10', platform: '搭乗口は当日確定' },
          arrival: { name: '那覇空港', time: '15:15', platform: '到着口は当日確定' },
          notes: ['空港到着後に保安検査場の締切時刻を確認', '受託手荷物がある場合は早めに手続きを完了する']
        }
      })
    ],
    undecided: ['ユニバーサルシティから伊丹空港までの具体的な交通経路・発車時刻']
  }
]

export const tripStays = [
  {
    id: 'stay-yodoyabashi',
    name: '相鉄フレッサイン 淀屋橋',
    checkIn: '2026-08-20',
    checkOut: '2026-08-23',
    nights: 3,
    address: '〒541-0041 大阪府大阪市中央区北浜3丁目2-23',
    mapsQuery: '相鉄フレッサイン 淀屋橋 大阪府大阪市中央区北浜3丁目2-23'
  },
  {
    id: 'stay-universal-city',
    name: 'オリエンタルホテル ユニバーサル・シティ',
    checkIn: '2026-08-23',
    checkOut: '2026-08-25',
    nights: 2,
    address: '〒554-0024 大阪府大阪市此花区島屋6丁目2-78',
    mapsQuery: 'オリエンタルホテル ユニバーサル・シティ 大阪府大阪市此花区島屋6丁目2-78'
  }
] as const

export const allEvents = tripDays.flatMap((day) => [
  ...(day.groups?.flatMap((group) => group.events) ?? []),
  ...(day.commonEvents ?? []),
  ...(day.events ?? [])
])

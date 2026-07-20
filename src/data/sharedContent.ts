export const sharedPageSlugs = ['usj', 'dining', 'kyoto'] as const
export type SharedPageSlug = (typeof sharedPageSlugs)[number]

export const memoCategories = ['general', 'usj', 'dining', 'kyoto', 'transport'] as const
export type MemoCategory = (typeof memoCategories)[number]

export interface SharedPage {
  slug: SharedPageSlug
  title: string
  description: string
  content: string
  updated_by: string
  updated_at: string
}

export interface SharedMemo {
  id: string
  category: MemoCategory
  title: string
  content: string
  author: string
  created_at: string
  updated_at: string
}

export const memoCategoryLabels: Record<MemoCategory, string> = {
  general: '旅行全体',
  usj: 'USJ',
  dining: '食事',
  kyoto: '京都',
  transport: '交通'
}

export const defaultSharedPages: Record<SharedPageSlug, SharedPage> = {
  usj: {
    slug: 'usj',
    title: 'USJ作戦',
    description: '朝一番の動線、優先アトラクション、食事と休憩の方針を共有します。',
    content: '入園後はスーパー・ニンテンドー・ワールド方面を第一候補にします。エリア入場状況を確認し、難しい場合はハリー・ポッター方面へ切り替えます。\n\n家族全員が絶対に乗りたいものを2つまで決め、それ以外は待ち時間と疲労で柔軟に選びます。昼食は混雑のピークを避け、11時台または14時以降を候補にします。',
    updated_by: '初期設定',
    updated_at: '2026-07-20T00:00:00+09:00'
  },
  dining: {
    slug: 'dining',
    title: '食事候補',
    description: '京都・大阪・USJ周辺の夕食候補と、店を選ぶ基準をまとめます。',
    content: '京都は旅行らしさを感じられる和食を第一候補とし、価格、椅子席、予約のしやすさを比較します。大阪は移動の負担が少なく、家族4人で入りやすい店を優先します。\n\n候補を追加するときは、店名だけでなく、エリア、予算、予約要否、行きたい理由をメモに残します。',
    updated_by: '初期設定',
    updated_at: '2026-07-20T00:00:00+09:00'
  },
  kyoto: {
    slug: 'kyoto',
    title: '京都メモ',
    description: '行きたい場所、甘味、暑さ対策を含めて、無理のない一日を組み立てます。',
    content: '観光地を数多く回るより、主目的地を1から2か所に絞り、移動、昼食、甘味、夕食を無理なくつなげます。\n\n抹茶や和菓子を楽しむ時間を確保し、暑さが厳しい場合は屋内や休憩時間を増やします。家族から候補が出たら、理由と一緒に共有メモへ追加します。',
    updated_by: '初期設定',
    updated_at: '2026-07-20T00:00:00+09:00'
  }
}

export const defaultSharedMemos: SharedMemo[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    category: 'usj',
    title: '朝一番の第一候補',
    content: 'ドンキーコングかマリオカートを第一候補として、エリア入場状況で切り替える。',
    author: '晴',
    created_at: '2026-07-20T12:00:00+09:00',
    updated_at: '2026-07-20T12:00:00+09:00'
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    category: 'dining',
    title: '京都の夕食で確認したい条件',
    content: '椅子席、家族4人で会話しやすいこと、予約の可否、予算を候補ごとに確認する。',
    author: '母',
    created_at: '2026-07-20T11:30:00+09:00',
    updated_at: '2026-07-20T11:30:00+09:00'
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    category: 'kyoto',
    title: '予定を詰め込みすぎない',
    content: '主目的地を1から2か所に絞り、昼食と休憩の時間を先に確保する。',
    author: '父',
    created_at: '2026-07-20T11:00:00+09:00',
    updated_at: '2026-07-20T11:00:00+09:00'
  }
]

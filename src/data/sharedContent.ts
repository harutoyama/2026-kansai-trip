export const sharedPageSlugs = ['usj', 'dining', 'kyoto'] as const
export type SharedPageSlug = (typeof sharedPageSlugs)[number]

export const memoCategories = ['general', 'usj', 'dining', 'kyoto', 'transport'] as const
export type MemoCategory = (typeof memoCategories)[number]

export const planStatuses = ['draft', 'active', 'backup', 'archived'] as const
export type PlanStatus = (typeof planStatuses)[number]

export const noteTypes = ['candidate', 'fact', 'question', 'todo'] as const
export type NoteType = (typeof noteTypes)[number]

export const noteStatuses = ['open', 'resolved', 'reflected', 'dismissed'] as const
export type NoteStatus = (typeof noteStatuses)[number]

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

export interface SharedPlan {
  id: string
  category: MemoCategory
  title: string
  description: string
  content: string
  status: PlanStatus
  author: string
  created_at: string
  updated_at: string
  source: 'page' | 'memo'
  pageSlug?: SharedPageSlug
}

export interface PlanningNote {
  id: string
  category: MemoCategory
  title: string
  content: string
  type: NoteType
  status: NoteStatus
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

export const planStatusLabels: Record<PlanStatus, string> = {
  draft: '検討中',
  active: '採用中',
  backup: '予備',
  archived: '終了'
}

export const noteTypeLabels: Record<NoteType, string> = {
  candidate: '候補',
  fact: '調査結果',
  question: '確認事項',
  todo: 'ToDo'
}

export const noteStatusLabels: Record<NoteStatus, string> = {
  open: '未対応',
  resolved: '確認済み',
  reflected: '作戦へ反映済み',
  dismissed: '不要'
}

const planTitlePattern = /^__plan__:(draft|active|backup|archived):(.*)$/s
const noteTitlePattern = /^__note__:(candidate|fact|question|todo):(open|resolved|reflected|dismissed):(.*)$/s

const basePlanTitles: Record<SharedPageSlug, string> = {
  usj: 'USJ基本作戦',
  dining: '食事基本作戦',
  kyoto: '京都基本作戦'
}

export function encodePlanTitle(title: string, status: PlanStatus) {
  return `__plan__:${status}:${title}`
}

export function encodeNoteTitle(title: string, type: NoteType, status: NoteStatus) {
  return `__note__:${type}:${status}:${title}`
}

export function pageToPlan(page: SharedPage): SharedPlan {
  return {
    id: `page:${page.slug}`,
    category: page.slug,
    title: basePlanTitles[page.slug],
    description: page.description,
    content: page.content,
    status: 'active',
    author: page.updated_by,
    created_at: page.updated_at,
    updated_at: page.updated_at,
    source: 'page',
    pageSlug: page.slug
  }
}

export function memoToPlan(memo: SharedMemo): SharedPlan | null {
  const match = memo.title.match(planTitlePattern)
  if (!match) return null

  return {
    id: memo.id,
    category: memo.category,
    title: match[2],
    description: '',
    content: memo.content,
    status: match[1] as PlanStatus,
    author: memo.author,
    created_at: memo.created_at,
    updated_at: memo.updated_at,
    source: 'memo'
  }
}

export function memoToPlanningNote(memo: SharedMemo): PlanningNote | null {
  if (memoToPlan(memo)) return null

  const match = memo.title.match(noteTitlePattern)
  return {
    id: memo.id,
    category: memo.category,
    title: match ? match[3] : memo.title,
    content: memo.content,
    type: match ? match[1] as NoteType : 'candidate',
    status: match ? match[2] as NoteStatus : 'open',
    author: memo.author,
    created_at: memo.created_at,
    updated_at: memo.updated_at
  }
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
    content: '京都は旅行らしさを感じられる和食を第一候補とし、価格、椅子席、予約のしやすさを比較します。大阪は移動の負担が少なく、家族4人で入りやすい店を優先します。\n\n候補を追加するときは、店名だけでなく、エリア、予算、予約要否、行きたい理由を検討メモに残します。',
    updated_by: '初期設定',
    updated_at: '2026-07-20T00:00:00+09:00'
  },
  kyoto: {
    slug: 'kyoto',
    title: '京都メモ',
    description: '行きたい場所、甘味、暑さ対策を含めて、無理のない一日を組み立てます。',
    content: '観光地を数多く回るより、主目的地を1から2か所に絞り、移動、昼食、甘味、夕食を無理なくつなげます。\n\n抹茶や和菓子を楽しむ時間を確保し、暑さが厳しい場合は屋内や休憩時間を増やします。家族から候補が出たら、理由と一緒に検討メモへ追加します。',
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

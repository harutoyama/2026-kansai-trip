import { useState } from 'react'
import type { SharedPlan } from '../data/sharedContent'
import type { useSharedContent } from '../hooks/useSharedContent'
import type { PlanInput } from '../hooks/useSharedContent'

const seedPlan: SharedPlan = {
  id: 'page:usj',
  category: 'usj',
  title: 'USJ基本作戦',
  description: '朝一番の動線を決めます。',
  content: '最初はニンテンドーエリアを確認します。',
  status: 'active',
  author: '晴',
  created_at: '2026-07-22T10:00:00+09:00',
  updated_at: '2026-07-22T10:00:00+09:00',
  source: 'page',
  pageSlug: 'usj'
}

export function useE2eSharedContent() {
  const [plans, setPlans] = useState<SharedPlan[]>([seedPlan])

  const updatePlan = async (plan: SharedPlan, input: PlanInput) => {
    const updated: SharedPlan = {
      ...plan,
      ...input,
      updated_at: '2026-07-22T12:00:00+09:00'
    }
    setPlans((current) => current.map((item) => (item.id === plan.id ? updated : item)))
    return updated as never
  }

  return {
    plans,
    planningNotes: [],
    loading: false,
    saving: false,
    error: null,
    configured: true,
    reload: async () => undefined,
    createPlan: async () => undefined as never,
    updatePlan,
    deletePlan: async () => undefined,
    createPlanningNote: async () => undefined as never,
    updatePlanningNote: async () => undefined as never,
    deletePlanningNote: async () => undefined
  } as ReturnType<typeof useSharedContent>
}

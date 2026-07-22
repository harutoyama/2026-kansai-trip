import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SharedPlan } from '../data/sharedContent'
import { useSharedContent } from '../hooks/useSharedContent'
import { PlanningPage } from './PlanningPage'

const basePlan: SharedPlan = {
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

function createHook(updatePlan: ReturnType<typeof vi.fn>) {
  return (() => ({
    plans: [basePlan],
    planningNotes: [],
    loading: false,
    saving: false,
    error: null,
    configured: true,
    reload: vi.fn(async () => undefined),
    createPlan: vi.fn(async () => undefined),
    updatePlan,
    deletePlan: vi.fn(async () => undefined),
    createPlanningNote: vi.fn(async () => undefined),
    updatePlanningNote: vi.fn(async () => undefined),
    deletePlanningNote: vi.fn(async () => undefined)
  })) as unknown as typeof useSharedContent
}

describe('PlanningPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows every base-plan field to be changed and passes the edited values to the update operation', async () => {
    const updatePlan = vi.fn(async () => undefined)
    render(<PlanningPage useSharedContentHook={createHook(updatePlan)} />)

    expect(screen.queryByText('家族間同期中')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'USJ基本作戦を編集' }))

    const dialog = screen.getByRole('dialog')
    const category = within(dialog).getByLabelText('カテゴリー') as HTMLSelectElement
    const title = within(dialog).getByLabelText('タイトル') as HTMLInputElement
    const status = within(dialog).getByLabelText('状態') as HTMLSelectElement
    const content = within(dialog).getByLabelText('本文') as HTMLTextAreaElement
    const author = within(dialog).getByLabelText('編集者') as HTMLSelectElement

    expect(category.disabled).toBe(false)
    expect(title.disabled).toBe(false)
    expect(status.disabled).toBe(false)

    fireEvent.change(category, { target: { value: 'dining' } })
    fireEvent.change(title, { target: { value: '雨天時の食事作戦' } })
    fireEvent.change(status, { target: { value: 'backup' } })
    fireEvent.change(content, { target: { value: '雨天時は屋内の食事候補を優先します。' } })
    fireEvent.change(author, { target: { value: '母' } })
    fireEvent.click(within(dialog).getByRole('button', { name: '保存して家族に同期' }))

    await waitFor(() => {
      expect(updatePlan).toHaveBeenCalledWith(basePlan, {
        category: 'dining',
        title: '雨天時の食事作戦',
        status: 'backup',
        content: '雨天時は屋内の食事候補を優先します。',
        author: '母'
      })
    })
  })
})

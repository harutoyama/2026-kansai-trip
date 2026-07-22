import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  defaultSharedMemos,
  defaultSharedPages,
  encodeNoteTitle,
  encodePageDescription,
  encodePlanTitle,
  memoToPlan,
  memoToPlanningNote,
  pageToPlan,
  type MemoCategory,
  type NoteStatus,
  type NoteType,
  type PlanStatus,
  type PlanningNote,
  type SharedMemo,
  type SharedPage,
  type SharedPageSlug,
  type SharedPlan
} from '../data/sharedContent'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface MemoInput {
  category: MemoCategory
  title: string
  content: string
  author: string
}

export interface PlanInput {
  category: MemoCategory
  title: string
  content: string
  status: PlanStatus
  author: string
}

export interface PlanningNoteInput {
  category: MemoCategory
  title: string
  content: string
  type: NoteType
  status: NoteStatus
  author: string
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : '共同編集データの処理に失敗しました。'
}

function mergePages(rows: SharedPage[]) {
  const merged = { ...defaultSharedPages }
  for (const row of rows) merged[row.slug] = row
  return merged
}

export function useSharedContent() {
  const [pages, setPages] = useState<Record<SharedPageSlug, SharedPage>>(defaultSharedPages)
  const [memos, setMemos] = useState<SharedMemo[]>(defaultSharedMemos)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const client = supabase
    if (!client) {
      setLoading(false)
      return
    }

    const [pagesResult, memosResult] = await Promise.all([
      client.from('shared_pages').select('*').order('slug'),
      client.from('shared_memos').select('*').order('created_at', { ascending: false })
    ])

    if (pagesResult.error) throw pagesResult.error
    if (memosResult.error) throw memosResult.error

    setPages(mergePages((pagesResult.data ?? []) as SharedPage[]))
    setMemos((memosResult.data ?? []) as SharedMemo[])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    const client = supabase
    if (!client) return

    void load().catch((loadError: unknown) => {
      setError(errorMessage(loadError))
      setLoading(false)
    })

    const channel = client
      .channel('shared-planning-content')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_pages' },
        () => void load().catch((loadError: unknown) => setError(errorMessage(loadError)))
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_memos' },
        () => void load().catch((loadError: unknown) => setError(errorMessage(loadError)))
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [load])

  const updatePage = async (plan: SharedPlan, input: PlanInput) => {
    const client = supabase
    if (!client) throw new Error('Supabase同期が未設定のため、保存できません。')
    if (!plan.pageSlug) throw new Error('基本作戦の識別情報がありません。')

    const slug = plan.pageSlug
    setSaving(true)
    setError(null)
    try {
      const { data, error: updateError } = await client
        .from('shared_pages')
        .update({
          title: input.title,
          description: encodePageDescription(plan.description, input.category, input.status),
          content: input.content,
          updated_by: input.author
        })
        .eq('slug', slug)
        .select('*')
        .single()
      if (updateError) throw updateError
      const updated = data as SharedPage
      setPages((current) => ({ ...current, [slug]: updated }))
      return updated
    } catch (updateError) {
      const message = errorMessage(updateError)
      setError(message)
      throw new Error(message)
    } finally {
      setSaving(false)
    }
  }

  const createMemo = async (input: MemoInput) => {
    const client = supabase
    if (!client) throw new Error('Supabase同期が未設定のため、投稿できません。')

    setSaving(true)
    setError(null)
    try {
      const { data, error: insertError } = await client
        .from('shared_memos')
        .insert(input)
        .select('*')
        .single()
      if (insertError) throw insertError
      const created = data as SharedMemo
      setMemos((current) => [created, ...current])
      return created
    } catch (insertError) {
      const message = errorMessage(insertError)
      setError(message)
      throw new Error(message)
    } finally {
      setSaving(false)
    }
  }

  const updateMemo = async (id: string, input: MemoInput) => {
    const client = supabase
    if (!client) throw new Error('Supabase同期が未設定のため、更新できません。')

    setSaving(true)
    setError(null)
    try {
      const { data, error: updateError } = await client
        .from('shared_memos')
        .update(input)
        .eq('id', id)
        .select('*')
        .single()
      if (updateError) throw updateError
      const updated = data as SharedMemo
      setMemos((current) => current.map((memo) => (memo.id === id ? updated : memo)))
      return updated
    } catch (updateError) {
      const message = errorMessage(updateError)
      setError(message)
      throw new Error(message)
    } finally {
      setSaving(false)
    }
  }

  const deleteMemo = async (id: string) => {
    const client = supabase
    if (!client) throw new Error('Supabase同期が未設定のため、削除できません。')

    setSaving(true)
    setError(null)
    try {
      const { error: deleteError } = await client.from('shared_memos').delete().eq('id', id)
      if (deleteError) throw deleteError
      setMemos((current) => current.filter((memo) => memo.id !== id))
    } catch (deleteError) {
      const message = errorMessage(deleteError)
      setError(message)
      throw new Error(message)
    } finally {
      setSaving(false)
    }
  }

  const plans = useMemo(() => {
    const pagePlans = Object.values(pages).map(pageToPlan)
    const memoPlans = memos.flatMap((memo) => {
      const plan = memoToPlan(memo)
      return plan ? [plan] : []
    })
    return [...pagePlans, ...memoPlans].sort((left, right) => right.updated_at.localeCompare(left.updated_at))
  }, [memos, pages])

  const planningNotes = useMemo(
    () => memos.flatMap((memo) => {
      const note = memoToPlanningNote(memo)
      return note ? [note] : []
    }).sort((left, right) => right.updated_at.localeCompare(left.updated_at)),
    [memos]
  )

  const createPlan = async (input: PlanInput) => createMemo({
    category: input.category,
    title: encodePlanTitle(input.title, input.status),
    content: input.content,
    author: input.author
  })

  const updatePlan = async (plan: SharedPlan, input: PlanInput) => {
    if (plan.source === 'page') return updatePage(plan, input)
    return updateMemo(plan.id, {
      category: input.category,
      title: encodePlanTitle(input.title, input.status),
      content: input.content,
      author: input.author
    })
  }

  const deletePlan = async (plan: SharedPlan) => {
    if (plan.source === 'page') throw new Error('基本作戦は削除できません。本文を編集してください。')
    return deleteMemo(plan.id)
  }

  const createPlanningNote = async (input: PlanningNoteInput) => createMemo({
    category: input.category,
    title: encodeNoteTitle(input.title, input.type, input.status),
    content: input.content,
    author: input.author
  })

  const updatePlanningNote = async (note: PlanningNote, input: PlanningNoteInput) => updateMemo(note.id, {
    category: input.category,
    title: encodeNoteTitle(input.title, input.type, input.status),
    content: input.content,
    author: input.author
  })

  const deletePlanningNote = async (note: PlanningNote) => deleteMemo(note.id)

  return {
    plans,
    planningNotes,
    loading,
    saving,
    error,
    configured: isSupabaseConfigured,
    reload: load,
    createPlan,
    updatePlan,
    deletePlan,
    createPlanningNote,
    updatePlanningNote,
    deletePlanningNote
  }
}

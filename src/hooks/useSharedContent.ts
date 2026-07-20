import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  defaultSharedMemos,
  defaultSharedPages,
  type MemoCategory,
  type SharedMemo,
  type SharedPage,
  type SharedPageSlug
} from '../data/sharedContent'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface MemoInput {
  category: MemoCategory
  title: string
  content: string
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

  const updatePage = async (slug: SharedPageSlug, content: string, updatedBy: string) => {
    const client = supabase
    if (!client) throw new Error('Supabase同期が未設定のため、保存できません。')

    setSaving(true)
    setError(null)
    try {
      const { data, error: updateError } = await client
        .from('shared_pages')
        .update({ content, updated_by: updatedBy })
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

  const sortedMemos = useMemo(
    () => [...memos].sort((left, right) => right.created_at.localeCompare(left.created_at)),
    [memos]
  )

  return {
    pages,
    memos: sortedMemos,
    loading,
    saving,
    error,
    configured: isSupabaseConfigured,
    reload: load,
    updatePage,
    createMemo,
    updateMemo,
    deleteMemo
  }
}

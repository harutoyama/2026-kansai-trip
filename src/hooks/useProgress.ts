import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { EventStatus, ProgressRecord } from '../types'

export function useProgress() {
  const [records, setRecords] = useState<Record<string, ProgressRecord>>({})
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) return
    const { data, error: queryError } = await supabase.from('event_progress').select('*')
    if (queryError) return setError(queryError.message)
    setRecords(Object.fromEntries((data ?? []).map((r) => [r.event_id, r as ProgressRecord])))
  }, [])

  useEffect(() => {
    void load()
    const client = supabase
    if (!client) return
    const channel = client.channel('event-progress').on('postgres_changes', { event: '*', schema: 'public', table: 'event_progress' }, () => void load()).subscribe()
    return () => { void client.removeChannel(channel) }
  }, [load])

  const updateStatus = async (eventId: string, status: EventStatus) => {
    const optimistic: ProgressRecord = { event_id: eventId, status, delay_minutes: 0, note: '', updated_at: new Date().toISOString() }
    setRecords((prev) => ({ ...prev, [eventId]: optimistic }))
    if (!supabase) return
    const { error: upsertError } = await supabase.from('event_progress').upsert(optimistic)
    if (upsertError) setError(upsertError.message)
  }

  return { records, updateStatus, error, configured: isSupabaseConfigured }
}

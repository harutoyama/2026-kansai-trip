import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && key)

export const supabase = isSupabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null

export async function validateStoredTripAccess() {
  if (!supabase) {
    return false
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return false
  }

  const { data, error } = await supabase.rpc('validate_trip_access')
  if (error || data !== true) {
    await supabase.auth.signOut()
    return false
  }

  return true
}

export async function verifyTripPin(pin: string) {
  if (!supabase) {
    throw new Error('Supabaseが設定されていません。')
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const { error: signInError } = await supabase.auth.signInAnonymously()
    if (signInError) {
      throw new Error(
        '匿名ログインを開始できません。Supabase Authの設定を確認してください。',
      )
    }
  }

  const { data, error } = await supabase.rpc('verify_trip_pin', {
    input_pin: pin,
  })

  if (error) {
    throw new Error('認証処理に失敗しました。時間を置いて再試行してください。')
  }

  return data === true
}

export async function clearTripAccess() {
  if (supabase) {
    await supabase.auth.signOut()
  }
}

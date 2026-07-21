import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { LockKeyhole } from 'lucide-react'
import {
  isSupabaseConfigured,
  validateStoredTripAccess,
  verifyTripPin,
} from '../lib/supabase'
import './AccessGate.css'

type AccessGateProps = {
  children: ReactNode
}

type AccessState = 'checking' | 'locked' | 'unlocked'

export function AccessGate({ children }: AccessGateProps) {
  const [accessState, setAccessState] = useState<AccessState>('checking')
  const [pin, setPin] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pinInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true

    async function checkAccess() {
      const isValid = await validateStoredTripAccess()
      if (active) {
        setAccessState(isValid ? 'unlocked' : 'locked')
      }
    }

    void checkAccess()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (accessState === 'locked') {
      pinInputRef.current?.focus()
    }
  }, [accessState])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!/^\d{4}$/.test(pin) || isSubmitting) {
      setErrorMessage('4桁の数字を入力してください。')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const success = await verifyTripPin(pin)
      if (!success) {
        setPin('')
        setErrorMessage('パスワードが違います。')
        pinInputRef.current?.focus()
        return
      }

      window.location.reload()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '認証処理に失敗しました。',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (accessState === 'unlocked') {
    return children
  }

  return (
    <main className="access-gate">
      <section className="access-gate-card" aria-labelledby="access-gate-title">
        <div className="access-gate-icon" aria-hidden="true">
          <LockKeyhole size={27} strokeWidth={2.2} />
        </div>
        <p className="access-gate-eyebrow">FAMILY ACCESS</p>
        <h1 id="access-gate-title">2026 関西旅行</h1>
        <p className="access-gate-description">
          家族用ページです。初回のみ4桁のパスワードを入力してください。
        </p>

        {!isSupabaseConfigured ? (
          <p className="access-gate-error" role="alert">
            Supabaseの接続設定が見つかりません。管理者に確認してください。
          </p>
        ) : accessState === 'checking' ? (
          <div className="access-gate-loading" role="status">
            <span className="access-gate-spinner" aria-hidden="true" />
            認証情報を確認しています
          </div>
        ) : (
          <form className="access-gate-form" onSubmit={handleSubmit}>
            <label htmlFor="trip-pin">4桁パスワード</label>
            <input
              ref={pinInputRef}
              id="trip-pin"
              name="trip-pin"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{4}"
              maxLength={4}
              value={pin}
              onChange={(event) => {
                setPin(event.target.value.replace(/\D/g, '').slice(0, 4))
                setErrorMessage('')
              }}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? 'trip-pin-error' : undefined}
            />
            {errorMessage ? (
              <p id="trip-pin-error" className="access-gate-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
            <button type="submit" disabled={pin.length !== 4 || isSubmitting}>
              {isSubmitting ? '確認中...' : 'ページを開く'}
            </button>
          </form>
        )}

        <p className="access-gate-note">
          認証情報はこのブラウザに保存され、通常は次回から入力不要です。
        </p>
      </section>
    </main>
  )
}

import {
  ArrowRight,
  MapPinned,
  Pencil,
  Sparkles,
  Utensils,
  Wifi,
  WifiOff,
  X
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  memoCategoryLabels,
  sharedPageSlugs,
  type SharedPageSlug
} from '../data/sharedContent'
import { useSharedContent } from '../hooks/useSharedContent'

const boardIcons = {
  usj: Sparkles,
  dining: Utensils,
  kyoto: MapPinned
} as const

const boardKickers: Record<SharedPageSlug, string> = {
  usj: 'UNIVERSAL STUDIOS JAPAN',
  dining: 'FAMILY DINING SHORTLIST',
  kyoto: 'KYOTO DAY NOTES'
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo'
  }).format(new Date(value))
}

export function PlanningPage() {
  const {
    pages,
    memos,
    loading,
    saving,
    error,
    configured,
    updatePage
  } = useSharedContent()
  const [selected, setSelected] = useState<SharedPageSlug>('usj')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [editorName, setEditorName] = useState('晴')
  const [notice, setNotice] = useState<string | null>(null)

  const page = pages[selected]
  const Icon = boardIcons[selected]
  const relatedMemos = memos.filter((memo) => memo.category === selected).slice(0, 3)

  const openEditor = () => {
    if (!configured) return
    setDraft(page.content)
    setNotice(null)
    setEditing(true)
  }

  const save = async () => {
    if (!draft.trim()) {
      setNotice('本文を入力してください。')
      return
    }
    try {
      await updatePage(selected, draft.trim(), editorName)
      setEditing(false)
      setNotice('作戦ページを保存しました。別端末にも同期されます。')
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : '保存に失敗しました。')
    }
  }

  return (
    <div className="shared-page">
      <header className="shared-hero shared-hero-planning">
        <div>
          <p>SHARED PLAYBOOK</p>
          <h1>作戦</h1>
          <span>USJ、食事、京都の計画を家族全員で更新します。</span>
        </div>
        <div className={`shared-sync-state ${configured ? 'is-online' : 'is-offline'}`}>
          {configured ? <Wifi size={15} aria-hidden="true" /> : <WifiOff size={15} aria-hidden="true" />}
          <span>{configured ? '家族間同期中' : '同期未設定'}</span>
        </div>
      </header>

      {!configured && (
        <section className="shared-setup-card" role="status">
          <WifiOff size={20} aria-hidden="true" />
          <div>
            <strong>現在は閲覧モードです</strong>
            <p>SupabaseのSQL適用とGitHub Actionsの環境変数設定後に、家族間の編集と同期が有効になります。</p>
          </div>
        </section>
      )}

      {error && <p className="shared-error" role="alert">{error}</p>}
      {notice && <p className="shared-notice" role="status">{notice}</p>}

      <div className="shared-board-tabs" role="tablist" aria-label="作戦カテゴリー">
        {sharedPageSlugs.map((slug) => {
          const TabIcon = boardIcons[slug]
          return (
            <button
              key={slug}
              type="button"
              role="tab"
              aria-selected={selected === slug}
              className={selected === slug ? 'is-active' : ''}
              onClick={() => {
                setSelected(slug)
                setNotice(null)
              }}
            >
              <TabIcon size={17} aria-hidden="true" />
              <span>{pages[slug].title}</span>
            </button>
          )
        })}
      </div>

      <section className="shared-board-card" aria-busy={loading}>
        <div className="shared-board-orbit" aria-hidden="true" />
        <div className="shared-board-heading">
          <div>
            <p>{boardKickers[selected]}</p>
            <h2><Icon size={24} aria-hidden="true" /> {page.title}</h2>
          </div>
          <button
            type="button"
            className="shared-icon-button"
            onClick={openEditor}
            disabled={!configured || loading}
            aria-label={`${page.title}を編集`}
          >
            <Pencil size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="shared-board-description">{page.description}</p>
        <div className="shared-board-content">{page.content}</div>
        <p className="shared-board-updated">
          {page.updated_by}さんが {formatUpdatedAt(page.updated_at)} に更新
        </p>
      </section>

      <section className="shared-related-section">
        <div className="shared-section-heading">
          <div>
            <p>RELATED NOTES</p>
            <h2>{memoCategoryLabels[selected]}の共有メモ</h2>
          </div>
          <Link to={`/notes?category=${selected}`}>
            すべて見る <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {relatedMemos.length > 0 ? (
          <div className="shared-mini-feed">
            {relatedMemos.map((memo) => (
              <article key={memo.id}>
                <div className="shared-avatar" aria-hidden="true">{memo.author.slice(0, 1)}</div>
                <div>
                  <p><strong>{memo.author}</strong><span>{formatUpdatedAt(memo.updated_at)}</span></p>
                  <h3>{memo.title}</h3>
                  <div>{memo.content}</div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="shared-empty-card">
            <p>このカテゴリーのメモはまだありません。</p>
            <Link to={`/notes?category=${selected}`}>共有メモを追加する</Link>
          </div>
        )}
      </section>

      {editing && (
        <div className="shared-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setEditing(false)
        }}>
          <section className="shared-modal" role="dialog" aria-modal="true" aria-labelledby="planning-editor-title">
            <div className="shared-modal-handle" />
            <div className="shared-modal-heading">
              <div>
                <p>SHARED EDITOR</p>
                <h2 id="planning-editor-title">{page.title}を編集</h2>
              </div>
              <button type="button" onClick={() => setEditing(false)} aria-label="閉じる">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <label className="shared-field">
              <span>本文</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={10000}
                rows={12}
              />
            </label>

            <label className="shared-field">
              <span>編集者</span>
              <select value={editorName} onChange={(event) => setEditorName(event.target.value)}>
                <option value="晴">晴</option>
                <option value="父">父</option>
                <option value="母">母</option>
                <option value="弟">弟</option>
              </select>
            </label>

            <button type="button" className="shared-primary-button" onClick={() => void save()} disabled={saving}>
              {saving ? '保存中' : '保存して家族に同期'}
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

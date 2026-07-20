import {
  MessageSquarePlus,
  Pencil,
  Plus,
  Trash2,
  Wifi,
  WifiOff,
  X
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  memoCategories,
  memoCategoryLabels,
  type MemoCategory,
  type SharedMemo
} from '../data/sharedContent'
import { useSharedContent } from '../hooks/useSharedContent'

type Filter = 'all' | MemoCategory

type EditorState =
  | { mode: 'create'; memo: null }
  | { mode: 'edit'; memo: SharedMemo }
  | null

interface MemoForm {
  category: MemoCategory
  title: string
  content: string
  author: string
}

const emptyForm: MemoForm = {
  category: 'general',
  title: '',
  content: '',
  author: '晴'
}

function isMemoCategory(value: string | null): value is MemoCategory {
  return value !== null && memoCategories.includes(value as MemoCategory)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo'
  }).format(new Date(value))
}

function wasEdited(memo: SharedMemo) {
  return Math.abs(new Date(memo.updated_at).getTime() - new Date(memo.created_at).getTime()) > 1000
}

export function NotesPage() {
  const {
    memos,
    loading,
    saving,
    error,
    configured,
    createMemo,
    updateMemo,
    deleteMemo
  } = useSharedContent()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCategory = searchParams.get('category')
  const [filter, setFilter] = useState<Filter>(isMemoCategory(requestedCategory) ? requestedCategory : 'all')
  const [editor, setEditor] = useState<EditorState>(null)
  const [form, setForm] = useState<MemoForm>(emptyForm)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (isMemoCategory(requestedCategory)) setFilter(requestedCategory)
  }, [requestedCategory])

  const filteredMemos = useMemo(
    () => (filter === 'all' ? memos : memos.filter((memo) => memo.category === filter)),
    [filter, memos]
  )

  const selectFilter = (next: Filter) => {
    setFilter(next)
    setNotice(null)
    if (next === 'all') setSearchParams({})
    else setSearchParams({ category: next })
  }

  const openCreate = () => {
    if (!configured) return
    setForm({ ...emptyForm, category: filter === 'all' ? 'general' : filter })
    setEditor({ mode: 'create', memo: null })
    setNotice(null)
  }

  const openEdit = (memo: SharedMemo) => {
    if (!configured) return
    setForm({
      category: memo.category,
      title: memo.title,
      content: memo.content,
      author: memo.author
    })
    setEditor({ mode: 'edit', memo })
    setNotice(null)
  }

  const save = async () => {
    if (!editor) return
    if (!form.title.trim() || !form.content.trim() || !form.author.trim()) {
      setNotice('タイトル、本文、編集者を入力してください。')
      return
    }

    const input = {
      category: form.category,
      title: form.title.trim(),
      content: form.content.trim(),
      author: form.author.trim()
    }

    try {
      if (editor.mode === 'create') await createMemo(input)
      else await updateMemo(editor.memo.id, input)
      setEditor(null)
      setNotice(editor.mode === 'create' ? '共有メモを投稿しました。' : '共有メモを更新しました。')
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : '保存に失敗しました。')
    }
  }

  const remove = async (memo: SharedMemo) => {
    if (!window.confirm(`「${memo.title}」を削除しますか。`)) return
    try {
      await deleteMemo(memo.id)
      setNotice('共有メモを削除しました。')
    } catch (deleteError) {
      setNotice(deleteError instanceof Error ? deleteError.message : '削除に失敗しました。')
    }
  }

  return (
    <div className="shared-page">
      <header className="shared-hero shared-hero-notes">
        <div>
          <p>FAMILY FEED</p>
          <h1>共有メモ</h1>
          <span>気づいたことや候補を投稿し、家族全員で編集できます。</span>
        </div>
        <div className={`shared-sync-state ${configured ? 'is-online' : 'is-offline'}`}>
          {configured ? <Wifi size={15} aria-hidden="true" /> : <WifiOff size={15} aria-hidden="true" />}
          <span>{configured ? 'Realtime同期' : '同期未設定'}</span>
        </div>
      </header>

      {!configured && (
        <section className="shared-setup-card" role="status">
          <WifiOff size={20} aria-hidden="true" />
          <div>
            <strong>現在はサンプル閲覧モードです</strong>
            <p>Supabase設定後は、同じURLを開いた別端末にも投稿・編集・削除が反映されます。</p>
          </div>
        </section>
      )}

      {error && <p className="shared-error" role="alert">{error}</p>}
      {notice && <p className="shared-notice" role="status">{notice}</p>}

      <section className="shared-composer-card">
        <div className="shared-avatar shared-avatar-large" aria-hidden="true">晴</div>
        <button type="button" onClick={openCreate} disabled={!configured}>
          <span>家族に共有するメモを追加</span>
          <Plus size={19} aria-hidden="true" />
        </button>
      </section>

      <div className="shared-filter-strip" role="tablist" aria-label="メモのカテゴリー">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={filter === 'all' ? 'is-active' : ''}
          onClick={() => selectFilter('all')}
        >
          すべて
        </button>
        {memoCategories.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={filter === category}
            className={filter === category ? 'is-active' : ''}
            onClick={() => selectFilter(category)}
          >
            {memoCategoryLabels[category]}
          </button>
        ))}
      </div>

      <section className="shared-feed" aria-busy={loading}>
        {filteredMemos.length > 0 ? filteredMemos.map((memo) => (
          <article className="shared-memo-card" key={memo.id}>
            <div className="shared-memo-top">
              <div className="shared-author-block">
                <div className="shared-avatar" aria-hidden="true">{memo.author.slice(0, 1)}</div>
                <div>
                  <p><strong>{memo.author}</strong><span>{memoCategoryLabels[memo.category]}</span></p>
                  <small>{formatDateTime(memo.created_at)}{wasEdited(memo) ? '・編集済み' : ''}</small>
                </div>
              </div>
              <div className="shared-memo-actions">
                <button type="button" onClick={() => openEdit(memo)} disabled={!configured} aria-label={`${memo.title}を編集`}>
                  <Pencil size={16} aria-hidden="true" />
                </button>
                <button type="button" onClick={() => void remove(memo)} disabled={!configured || saving} aria-label={`${memo.title}を削除`}>
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <h2>{memo.title}</h2>
            <div className="shared-memo-content">{memo.content}</div>
          </article>
        )) : (
          <div className="shared-empty-card shared-empty-feed">
            <MessageSquarePlus size={27} aria-hidden="true" />
            <h2>このカテゴリーのメモはありません</h2>
            <p>新しい候補や家族への連絡を追加できます。</p>
            <button type="button" onClick={openCreate} disabled={!configured}>メモを追加</button>
          </div>
        )}
      </section>

      {editor && (
        <div className="shared-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setEditor(null)
        }}>
          <section className="shared-modal" role="dialog" aria-modal="true" aria-labelledby="memo-editor-title">
            <div className="shared-modal-handle" />
            <div className="shared-modal-heading">
              <div>
                <p>FAMILY FEED EDITOR</p>
                <h2 id="memo-editor-title">{editor.mode === 'create' ? '共有メモを追加' : '共有メモを編集'}</h2>
              </div>
              <button type="button" onClick={() => setEditor(null)} aria-label="閉じる">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <label className="shared-field">
              <span>カテゴリー</span>
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as MemoCategory }))}
              >
                {memoCategories.map((category) => (
                  <option value={category} key={category}>{memoCategoryLabels[category]}</option>
                ))}
              </select>
            </label>

            <label className="shared-field">
              <span>タイトル</span>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                maxLength={120}
                placeholder="例: USJで朝一番に向かう場所"
              />
            </label>

            <label className="shared-field">
              <span>本文</span>
              <textarea
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                maxLength={5000}
                rows={8}
                placeholder="候補、理由、確認したいことを書きます。"
              />
            </label>

            <label className="shared-field">
              <span>編集者</span>
              <select
                value={form.author}
                onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
              >
                <option value="晴">晴</option>
                <option value="父">父</option>
                <option value="母">母</option>
                <option value="弟">弟</option>
              </select>
            </label>

            <button type="button" className="shared-primary-button" onClick={() => void save()} disabled={saving}>
              {saving ? '保存中' : editor.mode === 'create' ? '投稿して家族に同期' : '変更を保存'}
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

import {
  Lightbulb,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  WifiOff,
  X
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import {
  memoCategories,
  memoCategoryLabels,
  noteStatuses,
  noteStatusLabels,
  noteTypes,
  noteTypeLabels,
  planStatuses,
  planStatusLabels,
  type MemoCategory,
  type NoteStatus,
  type NoteType,
  type PlanStatus,
  type PlanningNote,
  type SharedPlan
} from '../data/sharedContent'
import {
  useSharedContent,
  type PlanningNoteInput,
  type PlanInput
} from '../hooks/useSharedContent'

type Filter = 'all' | MemoCategory

type SharedContentHook = typeof useSharedContent

type PlanningPageProps = {
  useSharedContentHook?: SharedContentHook
}

type EditorState =
  | { kind: 'plan'; mode: 'create'; plan: null }
  | { kind: 'plan'; mode: 'edit'; plan: SharedPlan }
  | { kind: 'note'; mode: 'create'; note: null }
  | { kind: 'note'; mode: 'edit'; note: PlanningNote }
  | null

const emptyPlanForm: PlanInput = {
  category: 'general',
  title: '',
  content: '',
  status: 'draft',
  author: '晴'
}

const emptyNoteForm: PlanningNoteInput = {
  category: 'general',
  title: '',
  content: '',
  type: 'candidate',
  status: 'open',
  author: '晴'
}

const familyMembers = ['晴', '父', '母', '弟'] as const

function normalizeEditorName(name: string) {
  return familyMembers.includes(name as (typeof familyMembers)[number]) ? name : '晴'
}

const planStatusOrder: Record<PlanStatus, number> = {
  active: 0,
  backup: 1,
  draft: 2,
  archived: 3
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

export function PlanningPage({ useSharedContentHook = useSharedContent }: PlanningPageProps = {}) {
  const {
    plans,
    planningNotes,
    loading,
    saving,
    error,
    configured,
    createPlan,
    updatePlan,
    deletePlan,
    createPlanningNote,
    updatePlanningNote,
    deletePlanningNote
  } = useSharedContentHook()
  const [filter, setFilter] = useState<Filter>('all')
  const [editor, setEditor] = useState<EditorState>(null)
  const [planForm, setPlanForm] = useState<PlanInput>(emptyPlanForm)
  const [noteForm, setNoteForm] = useState<PlanningNoteInput>(emptyNoteForm)
  const [notice, setNotice] = useState<string | null>(null)

  const visiblePlans = useMemo(
    () => plans
      .filter((plan) => filter === 'all' || plan.category === filter)
      .sort((left, right) => {
        const statusDifference = planStatusOrder[left.status] - planStatusOrder[right.status]
        return statusDifference || right.updated_at.localeCompare(left.updated_at)
      }),
    [filter, plans]
  )

  const visibleNotes = useMemo(
    () => planningNotes.filter((note) => filter === 'all' || note.category === filter),
    [filter, planningNotes]
  )

  const selectedCategory = filter === 'all' ? 'general' : filter

  const openCreatePlan = () => {
    if (!configured) return
    setPlanForm({ ...emptyPlanForm, category: selectedCategory })
    setEditor({ kind: 'plan', mode: 'create', plan: null })
    setNotice(null)
  }

  const openEditPlan = (plan: SharedPlan) => {
    if (!configured) return
    setPlanForm({
      category: plan.category,
      title: plan.title,
      content: plan.content,
      status: plan.status,
      author: normalizeEditorName(plan.author)
    })
    setEditor({ kind: 'plan', mode: 'edit', plan })
    setNotice(null)
  }

  const openCreateNote = () => {
    if (!configured) return
    setNoteForm({ ...emptyNoteForm, category: selectedCategory })
    setEditor({ kind: 'note', mode: 'create', note: null })
    setNotice(null)
  }

  const openEditNote = (note: PlanningNote) => {
    if (!configured) return
    setNoteForm({
      category: note.category,
      title: note.title,
      content: note.content,
      type: note.type,
      status: note.status,
      author: normalizeEditorName(note.author)
    })
    setEditor({ kind: 'note', mode: 'edit', note })
    setNotice(null)
  }

  const savePlan = async () => {
    if (!editor || editor.kind !== 'plan') return
    if (!planForm.title.trim() || !planForm.content.trim() || !planForm.author.trim()) {
      setNotice('タイトル、本文、編集者を入力してください。')
      return
    }

    const input = {
      ...planForm,
      title: planForm.title.trim(),
      content: planForm.content.trim(),
      author: planForm.author.trim()
    }

    try {
      if (editor.mode === 'create') await createPlan(input)
      else await updatePlan(editor.plan, input)
      setEditor(null)
      setNotice(editor.mode === 'create' ? '作戦を追加しました。' : '作戦を更新しました。')
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : '保存に失敗しました。')
    }
  }

  const saveNote = async () => {
    if (!editor || editor.kind !== 'note') return
    if (!noteForm.title.trim() || !noteForm.content.trim() || !noteForm.author.trim()) {
      setNotice('タイトル、本文、編集者を入力してください。')
      return
    }

    const input = {
      ...noteForm,
      title: noteForm.title.trim(),
      content: noteForm.content.trim(),
      author: noteForm.author.trim()
    }

    try {
      if (editor.mode === 'create') await createPlanningNote(input)
      else await updatePlanningNote(editor.note, input)
      setEditor(null)
      setNotice(editor.mode === 'create' ? '検討メモを追加しました。' : '検討メモを更新しました。')
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : '保存に失敗しました。')
    }
  }

  const removePlan = async (plan: SharedPlan) => {
    if (!window.confirm(`「${plan.title}」を削除しますか。`)) return
    try {
      await deletePlan(plan)
      setNotice('作戦を削除しました。')
    } catch (deleteError) {
      setNotice(deleteError instanceof Error ? deleteError.message : '削除に失敗しました。')
    }
  }

  const removeNote = async (note: PlanningNote) => {
    if (!window.confirm(`「${note.title}」を削除しますか。`)) return
    try {
      await deletePlanningNote(note)
      setNotice('検討メモを削除しました。')
    } catch (deleteError) {
      setNotice(deleteError instanceof Error ? deleteError.message : '削除に失敗しました。')
    }
  }

  const editingBasePlan = editor?.kind === 'plan' && editor.mode === 'edit' && editor.plan.source === 'page'

  return (
    <div className="shared-page planning-hub">
      <header className="shared-hero shared-hero-planning">
        <div>
          <p>FAMILY PLANNING HUB</p>
          <h1>計画</h1>
          <span>採用する作戦と、その判断材料になる候補・調査結果・確認事項を分けて管理します。</span>
        </div>
      </header>

      {!configured && (
        <section className="shared-setup-card" role="status">
          <WifiOff size={20} aria-hidden="true" />
          <div>
            <strong>現在は閲覧モードです</strong>
            <p>Supabase設定後は、作戦と検討メモを家族全員で追加・編集できます。</p>
          </div>
        </section>
      )}

      {error && <p className="shared-error" role="alert">{error}</p>}
      {notice && <p className="shared-notice" role="status">{notice}</p>}

      <div className="planning-filter-strip" role="tablist" aria-label="計画カテゴリー">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={filter === 'all' ? 'is-active' : ''}
          onClick={() => setFilter('all')}
        >
          すべて
        </button>
        {memoCategories.map((category) => (
          <button
            type="button"
            role="tab"
            aria-selected={filter === category}
            className={filter === category ? 'is-active' : ''}
            key={category}
            onClick={() => setFilter(category)}
          >
            {memoCategoryLabels[category]}
          </button>
        ))}
      </div>

      <section className="planning-section" aria-busy={loading}>
        <div className="planning-section-heading">
          <div>
            <p>PLAYBOOKS</p>
            <h2><Sparkles size={20} aria-hidden="true" /> 作戦</h2>
            <span>現在どう動くかをまとめた実行方針です。</span>
          </div>
          <button type="button" onClick={openCreatePlan} disabled={!configured}>
            <Plus size={17} aria-hidden="true" /> 作戦を追加
          </button>
        </div>

        <div className="planning-card-list">
          {visiblePlans.length > 0 ? visiblePlans.map((plan) => (
            <article className={`planning-plan-card status-${plan.status}`} key={plan.id}>
              <div className="planning-card-top">
                <div className="planning-card-labels">
                  <span>{memoCategoryLabels[plan.category]}</span>
                  <b>{planStatusLabels[plan.status]}</b>
                  {plan.source === 'page' && <em>基本作戦</em>}
                </div>
                <div className="planning-card-actions">
                  <button type="button" onClick={() => openEditPlan(plan)} disabled={!configured} aria-label={`${plan.title}を編集`}>
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  {plan.source === 'memo' && (
                    <button type="button" onClick={() => void removePlan(plan)} disabled={!configured || saving} aria-label={`${plan.title}を削除`}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <h3>{plan.title}</h3>
              {plan.description && <p className="planning-card-description">{plan.description}</p>}
              <div className="planning-card-content">{plan.content}</div>
              <small>{plan.author}さんが {formatUpdatedAt(plan.updated_at)} に更新</small>
            </article>
          )) : (
            <div className="shared-empty-card">
              <p>このカテゴリーの作戦はありません。</p>
              <button type="button" onClick={openCreatePlan} disabled={!configured}>作戦を追加</button>
            </div>
          )}
        </div>
      </section>

      <section className="planning-section planning-notes-section" aria-busy={loading}>
        <div className="planning-section-heading">
          <div>
            <p>DECISION MATERIALS</p>
            <h2><Lightbulb size={20} aria-hidden="true" /> 検討メモ</h2>
            <span>候補、調査結果、確認事項、ToDoを作戦と分けて残します。</span>
          </div>
          <button type="button" onClick={openCreateNote} disabled={!configured}>
            <Plus size={17} aria-hidden="true" /> メモを追加
          </button>
        </div>

        <div className="planning-card-list">
          {visibleNotes.length > 0 ? visibleNotes.map((note) => (
            <article className={`planning-note-card note-status-${note.status}`} key={note.id}>
              <div className="planning-card-top">
                <div className="planning-card-labels">
                  <span>{memoCategoryLabels[note.category]}</span>
                  <b>{noteTypeLabels[note.type]}</b>
                  <em>{noteStatusLabels[note.status]}</em>
                </div>
                <div className="planning-card-actions">
                  <button type="button" onClick={() => openEditNote(note)} disabled={!configured} aria-label={`${note.title}を編集`}>
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => void removeNote(note)} disabled={!configured || saving} aria-label={`${note.title}を削除`}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <h3>{note.title}</h3>
              <div className="planning-card-content">{note.content}</div>
              <small>{note.author}さんが {formatUpdatedAt(note.updated_at)} に更新</small>
            </article>
          )) : (
            <div className="shared-empty-card">
              <p>このカテゴリーの検討メモはありません。</p>
              <button type="button" onClick={openCreateNote} disabled={!configured}>メモを追加</button>
            </div>
          )}
        </div>
      </section>

      {editor && (
        <div className="shared-modal-backdrop" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
          if (event.currentTarget === event.target) setEditor(null)
        }}>
          <section className="shared-modal" role="dialog" aria-modal="true" aria-labelledby="planning-editor-title">
            <div className="shared-modal-handle" />
            <div className="shared-modal-heading">
              <div>
                <p>FAMILY PLANNING EDITOR</p>
                <h2 id="planning-editor-title">
                  {editor.kind === 'plan'
                    ? editor.mode === 'create' ? '作戦を追加' : '作戦を編集'
                    : editor.mode === 'create' ? '検討メモを追加' : '検討メモを編集'}
                </h2>
              </div>
              <button type="button" onClick={() => setEditor(null)} aria-label="閉じる">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {editor.kind === 'plan' ? (
              <>
                {editingBasePlan && <p className="planning-editor-hint">基本作戦は削除できません。カテゴリー、タイトル、状態、本文、編集者を更新できます。</p>}
                <label className="shared-field">
                  <span>カテゴリー</span>
                  <select
                    value={planForm.category}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setPlanForm((current) => ({ ...current, category: event.target.value as MemoCategory }))}
                  >
                    {memoCategories.map((category) => <option value={category} key={category}>{memoCategoryLabels[category]}</option>)}
                  </select>
                </label>
                <label className="shared-field">
                  <span>タイトル</span>
                  <input
                    value={planForm.title}
                    maxLength={80}
                    placeholder="例: USJ混雑時の代替作戦"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setPlanForm((current) => ({ ...current, title: event.target.value }))}
                  />
                </label>
                <label className="shared-field">
                  <span>状態</span>
                  <select
                    value={planForm.status}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setPlanForm((current) => ({ ...current, status: event.target.value as PlanStatus }))}
                  >
                    {planStatuses.map((status) => <option value={status} key={status}>{planStatusLabels[status]}</option>)}
                  </select>
                </label>
                <label className="shared-field">
                  <span>本文</span>
                  <textarea
                    value={planForm.content}
                    maxLength={5000}
                    rows={10}
                    placeholder="目的、優先順位、実行手順、代替案を書きます。"
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setPlanForm((current) => ({ ...current, content: event.target.value }))}
                  />
                </label>
                <label className="shared-field">
                  <span>編集者</span>
                  <select value={planForm.author} onChange={(event: ChangeEvent<HTMLSelectElement>) => setPlanForm((current) => ({ ...current, author: event.target.value }))}>
                    <option value="晴">晴</option>
                    <option value="父">父</option>
                    <option value="母">母</option>
                    <option value="弟">弟</option>
                  </select>
                </label>
                <button type="button" className="shared-primary-button" onClick={() => void savePlan()} disabled={saving}>
                  {saving ? '保存中' : '保存して家族に同期'}
                </button>
              </>
            ) : (
              <>
                <label className="shared-field">
                  <span>カテゴリー</span>
                  <select
                    value={noteForm.category}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setNoteForm((current) => ({ ...current, category: event.target.value as MemoCategory }))}
                  >
                    {memoCategories.map((category) => <option value={category} key={category}>{memoCategoryLabels[category]}</option>)}
                  </select>
                </label>
                <label className="shared-field">
                  <span>種類</span>
                  <select
                    value={noteForm.type}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setNoteForm((current) => ({ ...current, type: event.target.value as NoteType }))}
                  >
                    {noteTypes.map((type) => <option value={type} key={type}>{noteTypeLabels[type]}</option>)}
                  </select>
                </label>
                <label className="shared-field">
                  <span>状態</span>
                  <select
                    value={noteForm.status}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => setNoteForm((current) => ({ ...current, status: event.target.value as NoteStatus }))}
                  >
                    {noteStatuses.map((status) => <option value={status} key={status}>{noteStatusLabels[status]}</option>)}
                  </select>
                </label>
                <label className="shared-field">
                  <span>タイトル</span>
                  <input
                    value={noteForm.title}
                    maxLength={80}
                    placeholder="例: 母に夕食予算を確認"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setNoteForm((current) => ({ ...current, title: event.target.value }))}
                  />
                </label>
                <label className="shared-field">
                  <span>本文</span>
                  <textarea
                    value={noteForm.content}
                    maxLength={5000}
                    rows={8}
                    placeholder="候補、根拠、確認したいこと、次の行動を書きます。"
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNoteForm((current) => ({ ...current, content: event.target.value }))}
                  />
                </label>
                <label className="shared-field">
                  <span>編集者</span>
                  <select value={noteForm.author} onChange={(event: ChangeEvent<HTMLSelectElement>) => setNoteForm((current) => ({ ...current, author: event.target.value }))}>
                    <option value="晴">晴</option>
                    <option value="父">父</option>
                    <option value="母">母</option>
                    <option value="弟">弟</option>
                  </select>
                </label>
                <button type="button" className="shared-primary-button" onClick={() => void saveNote()} disabled={saving}>
                  {saving ? '保存中' : '保存して家族に同期'}
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

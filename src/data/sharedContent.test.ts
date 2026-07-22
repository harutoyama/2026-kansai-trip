import { describe, expect, it } from 'vitest'
import {
  encodeNoteTitle,
  encodePageDescription,
  encodePlanTitle,
  memoToPlan,
  memoToPlanningNote,
  pageToPlan,
  type SharedMemo,
  type SharedPage
} from './sharedContent'

const baseMemo: SharedMemo = {
  id: '1',
  category: 'usj',
  title: '候補',
  content: '本文',
  author: '晴',
  created_at: '2026-07-21T10:00:00+09:00',
  updated_at: '2026-07-21T10:00:00+09:00'
}

const basePage: SharedPage = {
  slug: 'kyoto',
  title: '京都メモ',
  description: '説明',
  content: '本文',
  updated_by: '母',
  updated_at: '2026-07-21T10:00:00+09:00'
}

describe('planning content adapters', () => {
  it('stores and restores additional plan metadata in the existing memo table', () => {
    const plan = memoToPlan({ ...baseMemo, title: encodePlanTitle('雨天時作戦', 'backup') })
    expect(plan).toMatchObject({ title: '雨天時作戦', status: 'backup', source: 'memo' })
  })

  it('stores and restores note type and lifecycle status', () => {
    const note = memoToPlanningNote({
      ...baseMemo,
      title: encodeNoteTitle('夕食予算を確認', 'question', 'resolved')
    })
    expect(note).toMatchObject({ title: '夕食予算を確認', type: 'question', status: 'resolved' })
  })

  it('keeps existing unencoded memos as open candidate notes', () => {
    const note = memoToPlanningNote(baseMemo)
    expect(note).toMatchObject({ title: '候補', type: 'candidate', status: 'open' })
  })

  it('keeps legacy shared pages compatible with their slug and active status', () => {
    expect(pageToPlan(basePage)).toMatchObject({
      id: 'page:kyoto',
      category: 'kyoto',
      title: '京都メモ',
      description: '説明',
      status: 'active',
      source: 'page'
    })
  })

  it('stores and restores editable base-plan category and status in the page description', () => {
    const page = {
      ...basePage,
      title: '雨天時の食事作戦',
      description: encodePageDescription('屋内候補を優先します。', 'dining', 'backup')
    }

    expect(pageToPlan(page)).toMatchObject({
      category: 'dining',
      title: '雨天時の食事作戦',
      description: '屋内候補を優先します。',
      status: 'backup',
      source: 'page'
    })
  })
})

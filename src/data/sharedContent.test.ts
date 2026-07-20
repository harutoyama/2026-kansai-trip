import { describe, expect, it } from 'vitest'
import {
  defaultSharedMemos,
  defaultSharedPages,
  memoCategories,
  sharedPageSlugs
} from './sharedContent'

describe('shared content defaults', () => {
  it('defines every planning page once', () => {
    expect(Object.keys(defaultSharedPages).sort()).toEqual([...sharedPageSlugs].sort())
  })

  it('uses only supported memo categories', () => {
    const supported = new Set(memoCategories)
    expect(defaultSharedMemos.every((memo) => supported.has(memo.category))).toBe(true)
  })

  it('provides unique default memo ids', () => {
    const ids = defaultSharedMemos.map((memo) => memo.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

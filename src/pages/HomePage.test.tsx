import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useSharedContent } from '../hooks/useSharedContent'
import { PreTripHome } from './HomePage'

const testHook = (() => ({
  plans: [],
  planningNotes: [],
  loading: false,
  saving: false,
  error: null,
  configured: true,
  reload: vi.fn(async () => undefined),
  createPlan: vi.fn(async () => undefined),
  updatePlan: vi.fn(async () => undefined),
  deletePlan: vi.fn(async () => undefined),
  createPlanningNote: vi.fn(async () => undefined),
  updatePlanningNote: vi.fn(async () => undefined),
  deletePlanningNote: vi.fn(async () => undefined)
})) as unknown as typeof useSharedContent

describe('PreTripHome', () => {
  it('does not display the family synchronization status in the top-right corner', () => {
    render(
      <MemoryRouter>
        <PreTripHome now={new Date('2026-07-22T12:00:00+09:00')} useSharedContentHook={testHook} />
      </MemoryRouter>
    )

    expect(screen.getByText('Kansai Journal')).toBeTruthy()
    expect(screen.queryByText('家族間同期中')).toBeNull()
  })
})

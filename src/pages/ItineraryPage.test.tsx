import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ItineraryPage } from './ItineraryPage'

describe('ItineraryPage', () => {
  it('shows one-character weekdays and switches the selected day', () => {
    render(<ItineraryPage />)

    for (const weekday of ['木', '金', '土', '日', '月', '火']) {
      expect(screen.getByText(weekday)).toBeTruthy()
    }
    expect(screen.queryByText('木曜日')).toBeNull()

    const tabs = screen.getAllByRole('tab')
    fireEvent.click(tabs[1])
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
    expect(tabs[0].getAttribute('aria-selected')).toBe('false')
  })
})

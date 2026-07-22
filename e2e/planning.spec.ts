import { expect, test } from '@playwright/test'

test('base plan fields can be edited and saved in a real browser', async ({ page }) => {
  await page.goto('/2026-kansai-trip/e2e.html?page=planning')

  await expect(page.getByText('家族間同期中')).toHaveCount(0)
  await page.getByRole('button', { name: 'USJ基本作戦を編集' }).click()

  const dialog = page.getByRole('dialog')
  const category = dialog.getByLabel('カテゴリー')
  const title = dialog.getByLabel('タイトル')
  const status = dialog.getByLabel('状態')
  const content = dialog.getByLabel('本文')
  const author = dialog.getByLabel('編集者')

  await expect(category).toBeEnabled()
  await expect(title).toBeEnabled()
  await expect(status).toBeEnabled()

  await category.selectOption('dining')
  await title.fill('雨天時の食事作戦')
  await status.selectOption('backup')
  await content.fill('雨天時は屋内の食事候補を優先します。')
  await author.selectOption('母')
  await dialog.getByRole('button', { name: '保存して家族に同期' }).click()

  const updatedCard = page.locator('.planning-plan-card').filter({ hasText: '雨天時の食事作戦' })
  await expect(updatedCard).toBeVisible()
  await expect(updatedCard).toContainText('食事')
  await expect(updatedCard).toContainText('予備')
  await expect(updatedCard).toContainText('雨天時は屋内の食事候補を優先します。')
  await expect(updatedCard).toContainText('母さんが')
})

test('itinerary tabs use compact centered weekdays', async ({ page }) => {
  await page.goto('/2026-kansai-trip/e2e.html?page=itinerary')

  const weekdays = page.locator('.cinema-tab-strip button small')
  await expect(weekdays).toHaveText(['木', '金', '土', '日', '月', '火'])
  await expect(page.getByText('木曜日')).toHaveCount(0)

  const firstWeekday = weekdays.first()
  expect(await firstWeekday.evaluate((element) => getComputedStyle(element).fontSize)).toBe('16px')
  expect(await firstWeekday.evaluate((element) => getComputedStyle(element).textAlign)).toBe('center')

  const tabs = page.getByRole('tab')
  await tabs.nth(1).click()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
})

export function formatJapaneseWeekday(date: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    weekday: 'short',
    timeZone: 'Asia/Tokyo'
  }).format(new Date(`${date}T12:00:00+09:00`))
}

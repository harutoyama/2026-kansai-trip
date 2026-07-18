import { ExternalLink } from 'lucide-react'
import type { EventStatus, TripEvent } from '../types'

const statusLabels: Record<EventStatus,string> = { not_started:'未開始', in_progress:'実行中', completed:'完了', delayed:'遅延', cancelled:'中止' }
const certaintyLabels = { confirmed:'確定', candidate:'候補', undecided:'未定' }

export function EventCard({event,status='not_started',onStatusChange}:{event:TripEvent,status?:EventStatus,onStatusChange?:(s:EventStatus)=>void}) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapsQuery ?? event.location ?? event.title)}`
  return <article className="card">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-sm font-bold text-sky-700">{event.start ?? '時刻未定'}{event.end ? `–${event.end}` : ''}</p><h3 className="mt-1 text-base font-bold">{event.title}</h3>{event.location && <p className="mt-1 text-sm text-slate-600">{event.location}</p>}</div>
      <span className={`badge ${event.certainty==='confirmed'?'bg-emerald-100 text-emerald-800':event.certainty==='candidate'?'bg-amber-100 text-amber-800':'bg-slate-100 text-slate-700'}`}>{certaintyLabels[event.certainty]}</span>
    </div>
    {event.description && <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>}
    <div className="mt-4 flex flex-wrap gap-2">
      {onStatusChange && <label className="flex-1 text-sm font-semibold">状態<span className="sr-only">を変更</span><select value={status} onChange={(e)=>onStatusChange(e.target.value as EventStatus)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"><option value="not_started">未開始</option><option value="in_progress">実行中</option><option value="completed">完了</option><option value="delayed">遅延</option><option value="cancelled">中止</option></select></label>}
      <a className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-sky-700" href={maps} target="_blank" rel="noreferrer">地図 <ExternalLink size={16}/></a>
    </div>
    {onStatusChange && <p className="mt-2 text-xs text-slate-500">現在: {statusLabels[status]}</p>}
  </article>
}

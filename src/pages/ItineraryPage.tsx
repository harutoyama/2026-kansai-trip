import { useState } from 'react'
import { EventCard } from '../components/EventCard'
import { tripDays } from '../data/trip'

export function ItineraryPage() {
  const [selected, setSelected] = useState(0)
  const day = tripDays[selected]

  return <div>
    <header>
      <p className="text-sm font-bold text-sky-700">5泊6日</p>
      <h1 className="text-2xl font-black">旅程</h1>
    </header>
    <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="tablist">
      {tripDays.map((d, i) => <button key={d.date} role="tab" aria-selected={selected === i} onClick={() => setSelected(i)} className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold ${selected === i ? 'bg-sky-700 text-white' : 'border border-slate-300 bg-white'}`}>
        8/{Number(d.date.slice(-2))}<br /><span className="text-xs">{d.dayNumber}日目</span>
      </button>)}
    </div>
    <section className="mt-4 card">
      <p className="text-sm font-bold text-sky-700">{day.area}</p>
      <h2 className="mt-1 text-xl font-black">{day.summary}</h2>
      {day.accommodation && <p className="mt-2 text-sm text-slate-600">宿泊: {day.accommodation}</p>}
    </section>
    {day.groups?.map(g => <section className="mt-5" key={g.id}>
      <h2 className="section-title">{g.label}{g.members ? `（${g.members.join('・')}）` : ''}</h2>
      <div className="space-y-3">{g.events.map(e => <EventCard key={e.id} event={e} />)}</div>
    </section>)}
    {day.commonEvents && <section className="mt-5">
      <h2 className="section-title">岡山合流後・家族共通</h2>
      <div className="space-y-3">{day.commonEvents.map(e => <EventCard key={e.id} event={e} />)}</div>
    </section>}
    <section className="mt-5">
      <h2 className="section-title">{day.groups ? 'その他' : '家族共通タイムライン'}</h2>
      <div className="space-y-3">{day.events?.map(e => <EventCard key={e.id} event={e} />)}</div>
    </section>
    {day.undecided && <section className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <h2 className="font-bold">検討中</h2>
      <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{day.undecided.map(x => <li key={x}>{x}</li>)}</ul>
    </section>}
  </div>
}

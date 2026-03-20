import { buildDayBlocks, buildTimelineSegments, durMin, fmtDur, fmtTime } from '~/lib/sleep'
import type { DayData } from '~/lib/sleep'

const DAYS_RU = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

const segColor: Record<string, string> = {
  ns: 'bg-[#3a3a6a]',
  nap: 'bg-[#54c8c8]',
  wb: 'bg-[#f5c842]',
}

interface Props {
  day: DayData
  prevLastWakeEnd?: Date
}

export function DayCard({ day, prevLastWakeEnd }: Props) {
  const date = new Date(day.date + 'T12:00:00')
  const dayName = DAYS_RU[date.getDay()]
  const dayNum = date.getDate()
  const month = MONTHS_RU[date.getMonth()]
  const year = date.getFullYear()

  const wbs = day.wake_periods.map((w) => ({ start: new Date(w.start), end: new Date(w.end) }))
  const wakeUp = wbs.length > 0 ? fmtTime(wbs[0].start) : '—'
  const bedtime = wbs.length > 0 ? fmtTime(wbs[wbs.length - 1].end) : '—'

  const totalWB = wbs.reduce((s, w) => s + durMin(w.start, w.end), 0)
  const totalNap = wbs
    .slice(0, -1)
    .reduce((s, w, i) => s + durMin(w.end, wbs[i + 1].start), 0)

  const blocks = buildDayBlocks(day, prevLastWakeEnd)
  const segments = buildTimelineSegments(day, prevLastWakeEnd)

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="bg-[#6c63d5] px-[18px] pt-[14px] pb-3 flex justify-between items-start gap-3">
        <div>
          <div className="text-white font-bold">
            <span className="text-xl">{dayNum} {month}</span>{' '}
            <span className="text-base opacity-75">{year}</span>
          </div>
          <div className="text-white/70 text-sm mt-0.5">{dayName}</div>
          <div className="flex flex-col gap-0.5 mt-1.5 text-white/85 text-sm">
            <span>↑ Подъем {wakeUp}</span>
            <span>↓ Отбой {bedtime}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex gap-2 items-baseline">
            <span className="text-white/65 text-xs tracking-wide">СВБ</span>
            <span className="text-white font-bold text-base">{fmtDur(totalWB)}</span>
          </div>
          <div className="flex gap-2 items-baseline">
            <span className="text-white/65 text-xs tracking-wide">СДС</span>
            <span className="text-white font-bold text-base">{fmtDur(totalNap)}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative h-[10px] bg-[var(--color-border)]">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`absolute top-0 h-full ${segColor[seg.type]}`}
            style={{ left: `${seg.leftPct.toFixed(2)}%`, width: `${seg.widthPct.toFixed(2)}%` }}
          />
        ))}
      </div>

      {/* Rows */}
      <div className="bg-[var(--color-surface)] divide-y divide-[var(--color-border)]/30">
        {blocks.map((block, i) => {
          if (block.type === 'ns') {
            return (
              <div key={i} className="grid grid-cols-[110px_1fr_auto] items-center px-[18px] py-2 gap-2 text-[#8888bb]">
                <span className="font-semibold text-sm">🌙 НС</span>
                <span className="text-sm">{fmtTime(block.start)}–{fmtTime(block.end)}</span>
                <span className="font-bold text-sm text-right">{fmtDur(block.durationMin)}</span>
              </div>
            )
          }
          if (block.type === 'wb') {
            return (
              <div key={i} className="grid grid-cols-[110px_1fr_auto] items-center px-[18px] py-2 gap-2 text-[var(--color-text)]">
                <span className="font-semibold text-sm">ВБ{block.index}</span>
                <span className="text-[var(--color-text-secondary)] text-sm">{fmtTime(block.start)}–{fmtTime(block.end)}</span>
                <span className="font-bold text-sm text-right">{fmtDur(block.durationMin)}</span>
              </div>
            )
          }
          // nap
          return (
            <div key={i} className="grid grid-cols-[110px_1fr_auto] items-center px-[18px] py-2 gap-2 text-[#6c63d5] dark:text-[#a29bfe]">
              <span className="font-semibold text-sm italic">
                z<sup className="text-[0.6em]">z</sup> ДС {block.index}
              </span>
              <span className="text-sm text-[#6c63d5]/80 dark:text-[#a29bfe]/80 italic">{fmtTime(block.start)}–{fmtTime(block.end)}</span>
              <span className="font-bold text-sm text-right">{fmtDur(block.durationMin)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

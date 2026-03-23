import { durMin } from '../../../shared/lib/time'
import type { DayData, DayBlock } from '../model/types'

export function buildDayBlocks(day: DayData, prevLastWakeEnd?: Date): DayBlock[] {
  const wbs = day.wake_periods.map((w) => ({
    start: new Date(w.start),
    end: new Date(w.end),
  }))

  const blocks: DayBlock[] = []

  if (prevLastWakeEnd && wbs.length > 0) {
    const nsEnd = wbs[0].start
    const dur = durMin(prevLastWakeEnd, nsEnd)
    if (dur > 0) {
      blocks.push({ type: 'ns', start: prevLastWakeEnd, end: nsEnd, durationMin: dur })
    }
  }

  wbs.forEach((wb, i) => {
    blocks.push({
      type: 'wb',
      index: i + 1,
      start: wb.start,
      end: wb.end,
      durationMin: durMin(wb.start, wb.end),
    })
    if (i < wbs.length - 1) {
      const napStart = wb.end
      const napEnd = wbs[i + 1].start
      const dur = durMin(napStart, napEnd)
      if (dur > 0) {
        blocks.push({
          type: 'nap',
          index: i + 1,
          start: napStart,
          end: napEnd,
          durationMin: dur,
        })
      }
    }
  })

  return blocks
}

export function buildTimelineSegments(
  day: DayData,
  prevLastWakeEnd?: Date,
): Array<{ type: 'ns' | 'nap' | 'wb'; leftPct: number; widthPct: number }> {
  const wbs = day.wake_periods.map((w) => ({ start: new Date(w.start), end: new Date(w.end) }))
  if (wbs.length === 0) return []

  const first = prevLastWakeEnd ?? wbs[0].start
  const last = wbs[wbs.length - 1].end
  const totalMin = durMin(first, last)
  if (totalMin <= 0) return []

  const toSeg = (type: 'ns' | 'nap' | 'wb', start: Date, end: Date) => {
    const s = Math.max(0, durMin(first, start))
    const e = Math.min(totalMin, durMin(first, end))
    if (e <= s) return null
    return { type, leftPct: (s / totalMin) * 100, widthPct: ((e - s) / totalMin) * 100 }
  }

  const segs = []
  if (prevLastWakeEnd) {
    const seg = toSeg('ns', prevLastWakeEnd, wbs[0].start)
    if (seg) segs.push(seg)
  }
  wbs.forEach((wb, i) => {
    const seg = toSeg('wb', wb.start, wb.end)
    if (seg) segs.push(seg)
    if (i < wbs.length - 1) {
      const napSeg = toSeg('nap', wb.end, wbs[i + 1].start)
      if (napSeg) segs.push(napSeg)
    }
  })

  return segs.filter(Boolean) as typeof segs
}

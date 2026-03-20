export interface WakePeriod {
  start: string
  end: string
}

export interface DayData {
  date: string
  wake_periods: WakePeriod[]
}

export interface NightSleep {
  type: 'ns'
  start: Date
  end: Date
  durationMin: number
}

export interface WakeBlock {
  type: 'wb'
  index: number
  start: Date
  end: Date
  durationMin: number
}

export interface NapBlock {
  type: 'nap'
  index: number
  start: Date
  end: Date
  durationMin: number
}

export type DayBlock = NightSleep | WakeBlock | NapBlock

export function durMin(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60000)
}

export function fmtTime(dt: Date): string {
  return dt.toTimeString().slice(0, 5)
}

export function fmtDur(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}ч ${m}м`
  return `${m}м`
}

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

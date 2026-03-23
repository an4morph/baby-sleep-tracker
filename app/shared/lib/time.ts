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

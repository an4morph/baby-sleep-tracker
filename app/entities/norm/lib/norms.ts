import type { SleepNormRange, NormDeviation } from '../model/types'

/**
 * Нормы сна — числовые диапазоны для сравнения с фактическими данными.
 * Все значения длительности в минутах.
 */

// Индекс = возраст в месяцах (0..24)
const NORMS_BY_MONTH: SleepNormRange[] = [
  /* 0 */  { ww: [30, 60],   svb: [420, 600], ds: [15, 180],  naps: [4, 8], sds: [360, 540], ns: [480, 540], os: [840, 1020] },
  /* 1 */  { ww: [30, 60],   svb: [420, 600], ds: [15, 180],  naps: [4, 8], sds: [360, 540], ns: [480, 540], os: [840, 1020] },
  /* 2 */  { ww: [45, 90],   svb: [420, 600], ds: [30, 120],  naps: [4, 5], sds: [300, 420], ns: [510, 660], os: [840, 1020] },
  /* 3 */  { ww: [60, 105],  svb: [480, 600], ds: [30, 120],  naps: [3, 4], sds: [270, 330], ns: [540, 630], os: [840, 960] },
  /* 4 */  { ww: [75, 135],  svb: [510, 600], ds: [30, 120],  naps: [3, 4], sds: [210, 300], ns: [600, 690], os: [840, 930] },
  /* 5 */  { ww: [105, 165], svb: [510, 660], ds: [40, 90],   naps: [3, 3], sds: [180, 270], ns: [600, 660], os: [780, 930] },
  /* 6 */  { ww: [120, 180], svb: [570, 660], ds: [40, 90],   naps: [2, 3], sds: [150, 210], ns: [600, 690], os: [780, 870] },
  /* 7 */  { ww: [120, 195], svb: [570, 660], ds: [40, 90],   naps: [2, 3], sds: [150, 210], ns: [600, 690], os: [780, 870] },
  /* 8 */  { ww: [135, 210], svb: [600, 660], ds: [60, 90],   naps: [2, 3], sds: [150, 180], ns: [630, 690], os: [780, 840] },
  /* 9 */  { ww: [150, 225], svb: [600, 690], ds: [60, 90],   naps: [2, 2], sds: [120, 180], ns: [630, 690], os: [750, 840] },
  /* 10 */ { ww: [165, 240], svb: [600, 690], ds: [60, 90],   naps: [2, 2], sds: [120, 180], ns: [630, 690], os: [750, 840] },
  /* 11 */ { ww: [180, 255], svb: [630, 690], ds: [60, 75],   naps: [2, 2], sds: [120, 150], ns: [630, 690], os: [750, 810] },
  /* 12 */ { ww: [180, 270], svb: [630, 720], ds: [60, 75],   naps: [2, 2], sds: [120, 150], ns: [630, 690], os: [720, 810] },
  /* 13 */ { ww: [180, 300], svb: [630, 720], ds: [60, 150],  naps: [1, 2], sds: [120, 150], ns: [630, 690], os: [720, 810] },
  /* 14 */ { ww: [195, 300], svb: [630, 720], ds: [60, 150],  naps: [1, 2], sds: [120, 150], ns: [630, 690], os: [720, 810] },
  /* 15 */ { ww: [210, 330], svb: [630, 750], ds: [60, 150],  naps: [1, 2], sds: [90, 150],  ns: [600, 690], os: [690, 810] },
  /* 16 */ { ww: [270, 360], svb: [630, 750], ds: [90, 150],  naps: [1, 1], sds: [90, 150],  ns: [600, 690], os: [690, 810] },
  /* 17 */ { ww: [270, 390], svb: [660, 750], ds: [90, 120],  naps: [1, 1], sds: [90, 120],  ns: [600, 690], os: [690, 780] },
  /* 18 */ { ww: [270, 420], svb: [660, 750], ds: [90, 120],  naps: [1, 1], sds: [90, 120],  ns: [600, 690], os: [690, 780] },
  /* 19 */ { ww: [300, 420], svb: [660, 750], ds: [90, 120],  naps: [1, 1], sds: [90, 120],  ns: [600, 660], os: [690, 780] },
  /* 20 */ { ww: [300, 420], svb: [660, 750], ds: [90, 120],  naps: [1, 1], sds: [90, 120],  ns: [600, 660], os: [690, 780] },
  /* 21 */ { ww: [300, 420], svb: [660, 750], ds: [90, 120],  naps: [1, 1], sds: [90, 120],  ns: [600, 660], os: [690, 780] },
  /* 22 */ { ww: [300, 420], svb: [660, 780], ds: [60, 120],  naps: [1, 1], sds: [60, 120],  ns: [600, 660], os: [660, 780] },
  /* 23 */ { ww: [300, 420], svb: [660, 780], ds: [60, 120],  naps: [1, 1], sds: [60, 120],  ns: [600, 660], os: [660, 780] },
  /* 24 */ { ww: [300, 420], svb: [660, 780], ds: [60, 120],  naps: [1, 1], sds: [60, 120],  ns: [600, 660], os: [660, 780] },
]

export { NORMS_BY_MONTH }

export function getNormForMonth(ageMonths: number): SleepNormRange {
  const idx = Math.max(0, Math.min(24, Math.round(ageMonths)))
  return NORMS_BY_MONTH[idx]
}

export function checkNorm(value: number, range: [number, number]): NormDeviation {
  if (value < range[0]) return 'below'
  if (value > range[1]) return 'above'
  return 'normal'
}

/**
 * Вычисляет возраст в месяцах на указанную дату.
 */
export function getAgeMonths(birthDate: Date, onDate: Date): number {
  const years = onDate.getFullYear() - birthDate.getFullYear()
  const months = onDate.getMonth() - birthDate.getMonth()
  const days = onDate.getDate() - birthDate.getDate()
  let total = years * 12 + months
  if (days < 0) total--
  return Math.max(0, total)
}

export interface SleepNormRange {
  ww: [number, number]       // ВБ — одно окно (мин)
  svb: [number, number]      // СВБ — суммарное бодрствование (мин)
  ds: [number, number]       // ДС — один дневной сон (мин)
  naps: [number, number]     // Кол-во ДС
  sds: [number, number]      // СДС — сумма дневных снов (мин)
  ns: [number, number]       // НС — ночной сон (мин)
  os: [number, number]       // ОС — общий сон (мин)
}

export type NormDeviation = 'below' | 'above' | 'normal'

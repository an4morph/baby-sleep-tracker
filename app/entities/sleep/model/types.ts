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

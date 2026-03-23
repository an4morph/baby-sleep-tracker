import { useEffect, useState } from 'react'
import { DayCard } from '../../../widgets/day-card'
import { BirthDateInput } from '../../../features/set-birth-date'
import type { DayData } from '../../../entities/sleep'

interface Props {
  days: DayData[]
}

export function TrackerPage({ days }: Props) {
  const [birthDate, setBirthDate] = useState<string | null>(null)

  useEffect(() => {
    try { setBirthDate(localStorage.getItem('birthDate')) } catch (e) {}
  }, [])

  return (
    <div>
      <BirthDateInput value={birthDate} onChange={setBirthDate} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {days.map((day, i) => {
          const prevDay = days[i + 1]
          const prevLastWakeEnd = prevDay
            ? new Date(prevDay.wake_periods[prevDay.wake_periods.length - 1].end)
            : undefined
          return (
            <DayCard
              key={day.date}
              day={day}
              prevLastWakeEnd={prevLastWakeEnd}
              birthDate={birthDate}
            />
          )
        })}
      </div>
    </div>
  )
}

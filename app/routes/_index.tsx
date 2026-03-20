import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { readFileSync } from 'fs'
import { join } from 'path'
import { DayCard } from '~/components/DayCard'
import type { DayData } from '~/lib/sleep'

export async function loader(_: LoaderFunctionArgs) {
  const filePath = join(process.cwd(), 'public', 'data', 'wake_periods.json')
  const raw = readFileSync(filePath, 'utf-8')
  const data: DayData[] = JSON.parse(raw)
  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))
  return sorted
}

export default function TrackerPage() {
  const days = useLoaderData<typeof loader>()

  return (
    <div className="flex flex-col gap-5">
      {days.map((day, i) => {
        const prevDay = days[i + 1]
        const prevLastWakeEnd = prevDay
          ? new Date(prevDay.wake_periods[prevDay.wake_periods.length - 1].end)
          : undefined
        return <DayCard key={day.date} day={day} prevLastWakeEnd={prevLastWakeEnd} />
      })}
    </div>
  )
}

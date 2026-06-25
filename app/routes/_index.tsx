import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { DayData } from '../entities/sleep'
import { TrackerPage } from '../pages/tracker'

export async function loader(_: LoaderFunctionArgs) {
  const filePath = join(process.cwd(), 'data', 'wake_periods.json')
  const raw = readFileSync(filePath, 'utf-8')
  const data: DayData[] = JSON.parse(raw)
  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))

  const childPath = join(process.cwd(), 'data', 'child.json')
  const child: { birthDate: string } = JSON.parse(readFileSync(childPath, 'utf-8'))

  return { days: sorted, birthDate: child.birthDate }
}

export default function IndexRoute() {
  const { days, birthDate } = useLoaderData<typeof loader>()
  return <TrackerPage days={days} birthDate={birthDate} />
}

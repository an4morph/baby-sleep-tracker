import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { DayData } from '../entities/sleep'
import { TrackerPage } from '../pages/tracker'

export async function loader(_: LoaderFunctionArgs) {
  const filePath = join(process.cwd(), 'public', 'data', 'wake_periods.json')
  const raw = readFileSync(filePath, 'utf-8')
  const data: DayData[] = JSON.parse(raw)
  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date))
  return sorted
}

export default function IndexRoute() {
  const days = useLoaderData<typeof loader>()
  return <TrackerPage days={days} />
}

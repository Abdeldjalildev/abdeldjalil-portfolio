import { useEffect, useMemo, useState } from 'react'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { getFirebaseApp } from '../../firebase/app.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'
import { useI18n } from '../../i18n/context.ts'

type DailyAnalytics = {
  eventCounts?: Record<string, number>
  pathCounts?: Record<string, number>
  uniqueVisitors?: number
}
type DailyPoint = DailyAnalytics & { date: string }
const EVENTS = ['page_view','project_view','project_live_demo_click','github_click','contact_click','social_click','service_view','resume_download'] as const

function dateKey(daysAgo: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}
function decodePath(key: string): string {
  try {
    const normalized = key.replaceAll('-', '+').replaceAll('_', '/')
    const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)))
  } catch { return key }
}

export default function AnalyticsAdmin() {
  const { t } = useI18n()
  const [points, setPoints] = useState<DailyPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const db = getFirestore(getFirebaseApp())
        const snapshots = await Promise.all(Array.from({ length: 14 }, (_, index) => {
          const date = dateKey(index)
          return getDoc(doc(db, 'analyticsDaily', date)).then(snapshot => ({
            date,
            ...(snapshot.exists() ? (snapshot.data() as DailyAnalytics) : {}),
          }))
        }))
        if (active) setPoints(snapshots)
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const totals = useMemo(() => {
    const result = Object.fromEntries(EVENTS.map(event => [event, 0])) as Record<string, number>
    let uniqueVisitors = 0
    for (const point of points) {
      for (const event of EVENTS) result[event] += point.eventCounts?.[event] ?? 0
      uniqueVisitors += point.uniqueVisitors ?? 0
    }
    return { result, uniqueVisitors }
  }, [points])

  const topPaths = useMemo(() => {
    const counts = new Map<string, number>()
    for (const point of points) for (const [key, count] of Object.entries(point.pathCounts ?? {})) {
      const path = decodePath(key)
      counts.set(path, (counts.get(path) ?? 0) + count)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [points])

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>
  if (error) return <Surface role="alert"><Text variant="muted">{t('admin_analytics_load_error')}</Text></Surface>

  return <div className="grid gap-8">
    <header className="grid gap-2"><Heading level={1}>{t('route_analytics')}</Heading><Text variant="lead">{t('admin_analytics_subtitle')}</Text></header>
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-labelledby="analytics-summary">
      <Heading level={2} id="analytics-summary" className="sr-only">{t('admin_analytics_summary')}</Heading>
      <Surface><Text variant="muted">{t('admin_analytics_unique_visitors')}</Text><p className="mt-2 text-h3 font-semibold text-foreground">{totals.uniqueVisitors}</p></Surface>
      <Surface><Text variant="muted">{t('admin_analytics_page_views')}</Text><p className="mt-2 text-h3 font-semibold text-foreground">{totals.result.page_view}</p></Surface>
      <Surface><Text variant="muted">{t('admin_analytics_project_views')}</Text><p className="mt-2 text-h3 font-semibold text-foreground">{totals.result.project_view}</p></Surface>
      <Surface><Text variant="muted">{t('admin_analytics_contact_clicks')}</Text><p className="mt-2 text-h3 font-semibold text-foreground">{totals.result.contact_click}</p></Surface>
    </section>
    <section className="grid gap-4" aria-labelledby="analytics-events"><Heading level={2} id="analytics-events">{t('admin_analytics_events')}</Heading><Surface as="ul" className="grid gap-3">{EVENTS.map(event => <li key={event} className="flex justify-between gap-4 border-b border-border py-2 last:border-0"><span className="text-foreground-muted">{event}</span><strong className="text-foreground">{totals.result[event]}</strong></li>)}</Surface></section>
    <section className="grid gap-4" aria-labelledby="analytics-pages"><Heading level={2} id="analytics-pages">{t('admin_analytics_top_pages')}</Heading>{topPaths.length === 0 ? <Surface><Text variant="muted">{t('admin_analytics_empty')}</Text></Surface> : <Surface as="ul" className="grid gap-3">{topPaths.map(([path, count]) => <li key={path} className="flex justify-between gap-4 border-b border-border py-2 last:border-0"><span className="truncate text-foreground-muted">{path}</span><strong className="text-foreground">{count}</strong></li>)}</Surface>}</section>
  </div>
}

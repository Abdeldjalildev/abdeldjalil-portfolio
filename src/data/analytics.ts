import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirebaseApp } from '../firebase/app.ts'

export const ANALYTICS_EVENTS = [
  'page_view',
  'project_view',
  'project_live_demo_click',
  'github_click',
  'contact_click',
  'social_click',
  'service_view',
  'resume_download',
] as const

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number]

type AnalyticsPayload = {
  event: AnalyticsEvent
  path?: string
  projectId?: string
  serviceId?: string
}

type AnalyticsResponse = { accepted: boolean }

let visitorId: string | null = null

function getVisitorId(): string {
  if (visitorId) return visitorId
  const storageKey = 'portfolio.analytics.visitor'
  try {
    const stored = window.localStorage.getItem(storageKey)
    if (stored && /^[A-Za-z0-9_-]{16,100}$/.test(stored)) {
      visitorId = stored
      return stored
    }
  } catch {}

  const generated =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replaceAll('-', '')
      : String(Date.now().toString(36) + Math.random().toString(36).slice(2))
  visitorId = generated
  try { window.localStorage.setItem(storageKey, generated) } catch {}
  return generated
}

export function trackEvent(event: AnalyticsEvent, details: Omit<AnalyticsPayload, 'event'> = {}): void {
  if (typeof window === 'undefined') return
  try {
    const functions = getFunctions(getFirebaseApp(), 'us-central1')
    const callable = httpsCallable<AnalyticsPayload, AnalyticsResponse>(functions, 'recordAnalyticsEvent')
    void callable({ ...details, event, path: details.path ?? window.location.pathname, visitorId: getVisitorId() }).catch(() => {})
  } catch {
    // Firebase configuration or SDK initialization must never block the UI.
  }
}

import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { getFirebaseApp } from './app.ts'

let initialized = false

export function initializeConfiguredAppCheck(): void {
  if (initialized || typeof window === 'undefined') return
  const siteKey = String(import.meta.env.VITE_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY ?? '').trim()
  if (!siteKey) return

  initializeAppCheck(getFirebaseApp(), {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  })
  initialized = true
}

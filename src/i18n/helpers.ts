/**
 * Phase 06 - i18n internal helpers.
 *
 * Extracted so that I18nProvider.tsx exports only a component
 * (satisfying react-refresh/only-export-components). These are not part of
 * the public API.
 */

import type { Locale } from '../data/enums.ts'
import type { TFunction } from './types.ts'

// Locale-only storage. Scoped key; stores only the locale string.
export const LOCALE_STORAGE_KEY = 'abdeldjalil_portfolio_locale'

/** Safe locale lookup; unknown/corrupt persisted values fall back to default. */
export function readPersistedLocale(defaultLocale: Locale): Locale {
  if (typeof window === 'undefined') return defaultLocale
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'en' || stored === 'ar') return stored as Locale
    return defaultLocale
  } catch {
    // Storage unavailable (privacy mode / blocked) - default applies.
    return defaultLocale
  }
}

/** Persist the chosen locale. Failures are non-fatal (preference only). */
export function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Preference could not be stored; the choice still applies for this visit.
  }
}

/**
 * Build a translation function for the active dictionary.
 * Unknown keys fall back to the key itself (never a blank), with optional
 * `{key}` interpolation for dynamic values.
 */
export function makeTranslator(dict: Record<string, string>): TFunction {
  return (key: string, interpolations?: Record<string, string | number>) => {
    const value = Object.prototype.hasOwnProperty.call(dict, key)
      ? (dict[key] as string)
      : key

    if (!interpolations) return value
    return value.replace(/\{(\w+)\}/g, (_, name: string) => {
      const v = interpolations[name]
      return v != null ? String(v) : `{${name}}`
    })
  }
}

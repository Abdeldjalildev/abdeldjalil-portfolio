import type { Locale } from '../data/enums.ts'
import type { TFunction, TranslationKey } from './types.ts'

export const LOCALE_STORAGE_KEY = 'abdeldjalil_portfolio_locale'

export function hasPersistedLocale(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return stored === 'en' || stored === 'ar'
  } catch {
    return false
  }
}

export function readPersistedLocale(defaultLocale: Locale): Locale {
  if (typeof window === 'undefined') return defaultLocale
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored === 'en' || stored === 'ar') return stored
    return defaultLocale
  } catch {
    return defaultLocale
  }
}

export function persistLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Preference storage is non-critical.
  }
}

export function makeTranslator(dict: Record<TranslationKey, string>): TFunction {
  return (key, interpolations) => {
    const value = dict[key]
    if (!interpolations) return value
    return value.replace(/\{(\w+)\}/g, (_, name: string) => {
      const v = interpolations[name]
      return v != null ? String(v) : `{${name}}`
    })
  }
}

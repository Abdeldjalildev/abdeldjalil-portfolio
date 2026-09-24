import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_LOCALE, type Locale } from '../data/enums.ts'
import { dictionaries, getDirection } from './index.ts'
import { I18nContext } from './context.ts'
import { LOCALE_STORAGE_KEY, hasPersistedLocale, makeTranslator, persistLocale, readPersistedLocale } from './helpers.ts'
import { getPublicDefaultLocale } from '../data/publicSettings.ts'

/**
 * Phase 06 — i18n provider.
 *
 * Single source of truth for locale state. Owns:
 *  - locale resolution (default → persisted choice → explicit user switch)
 *  - deterministic locale switching with persistence
 *  - document-boundary application of <html lang> and <html dir>
 *
 * No page reload is required: switching re-renders through context, and the
 * effect below synchronizes the document attributes.
 */
export function I18nProvider({ children }: { children: ReactNode }): ReactNode {
  const [locale, setLocaleState] = useState<Locale>(() => readPersistedLocale(DEFAULT_LOCALE))
  const userSelectedLocale = useRef(false)

  const setLocale = useCallback((next: Locale) => {
    userSelectedLocale.current = true
    setLocaleState(next)
    persistLocale(next)
  }, [])

  useEffect(() => {
    if (hasPersistedLocale()) return
    let active = true
    void getPublicDefaultLocale().then(defaultLocale => {
      if (active && !userSelectedLocale.current && defaultLocale) setLocaleState(defaultLocale)
    })
    return () => { active = false }
  }, [])

  const dir = getDirection(locale)

  // Document boundary: keep <html lang> and <html dir> in sync with locale.
  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = dir
  }, [locale, dir])

  // Runtime safety net: clear a malformed persisted value so a corrupt key
  // cannot survive across reloads.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
      if (stored !== 'en' && stored !== 'ar' && stored !== null) {
        window.localStorage.removeItem(LOCALE_STORAGE_KEY)
      }
    } catch {
      // Storage unavailable — nothing to clean.
    }
  }, [])

  const value = useMemo(
    () => ({
      locale,
      dir,
      t: makeTranslator(dictionaries[locale]),
      setLocale,
    }),
    [locale, dir, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}




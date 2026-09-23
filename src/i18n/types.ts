/**
 * Phase 06 — i18n architecture contract.
 *
 * The type layer is strongly typed so a missing translation key is a compile
 * error rather than a runtime blank. Phase 06 ships a minimal, dependency-free
 * implementation because the requirement surface (two locales, key-based
 * lookup, locale switching) is fully covered by the existing stack; a general-
 * purpose i18n framework would add a client bundle and runtime API that this
 * phase does not justify.
 */

import type { Locale } from '../data/enums.ts'

/** A plain key→string translation map for one locale. */
export type Dictionary = Record<string, string>

/** Maps each locale to its translation dictionary. */
export type Dictionaries = Record<Locale, Dictionary>

/** Strongly-typed accessor: only known keys are accepted. */
export type DictionaryOf<D extends Dictionary> = {
  [K in keyof D]: D[K]
}

/** The translation function contract. */
export type TFunction = (
  key: string,
  interpolations?: Record<string, string | number>,
) => string

/**
 * The public shape of the i18n context.
 * `I18nProvider.tsx` augments this with `setLocale`; this file keeps the
 * locale/dir/t contract that is stable across the app shell.
 */
export type I18nContextValue = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: TFunction
  setLocale: (next: Locale) => void
}

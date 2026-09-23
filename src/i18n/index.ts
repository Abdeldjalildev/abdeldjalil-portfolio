/**
 * Phase 06 — i18n index.
 *
 * Public surface for the i18n system. Exposes the dictionaries, the strongly
 * typed locale list, and the locale→direction helper used by the app shell to
 * set `<html dir>` and `<html lang>` at the document boundary.
 */

import { LOCALES, DEFAULT_LOCALE, type Locale } from '../data/enums.ts'
import { en } from './locales/en.ts'
import { ar } from './locales/ar.ts'
import type { Dictionaries, TFunction } from './types.ts'

export { en, ar }
export type { Dictionaries, TFunction }
export { LOCALES, DEFAULT_LOCALE, type Locale }

export const dictionaries: Dictionaries = {
  en,
  ar,
}

/** Direction of a locale: English is LTR, Arabic is RTL. */
export const LOCALE_DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return LOCALE_DIRECTION[locale] ?? 'ltr'
}

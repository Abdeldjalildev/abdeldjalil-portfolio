import type { Locale } from '../data/enums.ts'
import type { en } from './locales/en.ts'

export type Dictionary = typeof en
export type TranslationKey = keyof Dictionary
export type Dictionaries = Record<Locale, Dictionary>

export type TFunction = (
  key: TranslationKey,
  interpolations?: Record<string, string | number>,
) => string

export type I18nContextValue = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: TFunction
  setLocale: (next: Locale) => void
}

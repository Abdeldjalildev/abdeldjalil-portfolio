/**
 * Phase 06 — Locale switcher.
 *
 * Accessible two-option toggle. Persists the choice to localStorage and lets
 * the I18nProvider synchronize the document lang/dir without a reload.
 */
import { type JSX } from 'react'
import { useI18n } from '../../i18n/context.ts'
import type { Locale } from '../../data/enums.ts'

export function LocaleSwitcher(): JSX.Element {
  const { locale, setLocale, t } = useI18n()
  const nextLocale: Locale = locale === 'en' ? 'ar' : 'en'

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground-muted transition-standard hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      aria-label={t('locale_switch_label')}
      title={t('locale_switch_label')}
    >
      <span aria-hidden="true">
        {locale === 'en' ? t('locale_english') : t('locale_arabic')}
      </span>
      <span aria-hidden="true" className="text-xs opacity-60">
        /
      </span>
      <span className="font-semibold">
        {nextLocale === 'en' ? t('locale_english') : t('locale_arabic')}
      </span>
    </button>
  )
}

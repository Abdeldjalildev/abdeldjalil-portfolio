import { createContext, useContext } from 'react'
import type { I18nContextValue } from './types.ts'

/**
 * Phase 06 — i18n React context.
 *
 * Split from I18nProvider.tsx so that the provider file exports only a
 * component (react-refresh/only-export-components), mirroring the Phase 04
 * auth pattern (AuthProvider.tsx + context.ts).
 */
export const I18nContext = createContext<I18nContextValue | null>(null)

/** Access the active locale, direction and translator. Throws outside the provider. */
export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext)
  if (value == null) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return value
}

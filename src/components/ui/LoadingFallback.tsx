import { type ReactNode } from 'react'
import { useI18n } from '../../i18n/context.ts'

export default function LoadingFallback(): ReactNode {
  const { t } = useI18n()

  return (
    <div
      role="status"
      aria-label={t('loading_label')}
      className="grid min-h-[12rem] place-items-center"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )
}

export { LoadingFallback }

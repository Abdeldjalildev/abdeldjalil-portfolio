import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/context.ts'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center gap-4 self-center py-16 text-center">
      <h1 className="text-h1 font-semibold text-foreground">404</h1>
      <p className="text-foreground-muted">{t('not_found_message')}</p>
      <Link
        to="/"
        className="inline-flex items-center rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-standard hover:bg-surface"
      >
        {t('not_found_return_home')}
      </Link>
    </div>
  )
}

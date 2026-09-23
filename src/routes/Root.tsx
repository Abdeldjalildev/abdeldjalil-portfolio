import { useI18n } from '../i18n/context.ts'

export type RootHandle = {
  title: string
  hideInNavigation?: boolean
  devOnly?: boolean
}

export default function Root() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center gap-8 py-16 text-center">
      <h1 className="text-display font-semibold text-foreground">{t('root_title')}</h1>
      <p className="max-w-prose text-lead text-foreground-muted">{t('root_subtitle')}</p>
    </div>
  )
}

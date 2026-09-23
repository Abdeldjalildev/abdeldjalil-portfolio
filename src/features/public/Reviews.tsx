import { useEffect, useState } from 'react'
import type { Review } from '../../data/types.ts'
import { listReviews } from '../cms/reviews.ts'
import { useI18n } from '../../i18n/context.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'
import { ProjectMedia } from './ProjectMedia.tsx'

type ReviewRecord = Review & { id: string }
const localized = (value: { en: string; ar: string }, locale: 'en' | 'ar') => value[locale] || value.en

export default function Reviews() {
  const { locale, t } = useI18n()
  const [items, setItems] = useState<ReviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    listReviews(false).then(result => active && setItems(result.items)).catch(() => active && setError(true)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>
  if (error) return <Surface role="alert"><Text variant="muted">{t('reviews_load_error')}</Text></Surface>
  if (items.length === 0) return <Surface><Heading level={1}>{t('reviews_title')}</Heading><Text variant="muted">{t('reviews_empty')}</Text></Surface>

  const average = items.reduce((sum, item) => sum + item.rating, 0) / items.length
  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <Heading level={1}>{t('reviews_title')}</Heading>
        <Text variant="lead">{t('reviews_subtitle')}</Text>
        <p className="text-body font-medium text-foreground">{t('reviews_average', { average: average.toFixed(1), count: items.length })}</p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        {items.map(review => (
          <Surface as="article" key={review.id} className="grid gap-5">
            <div className="flex items-start gap-4">
              {review.avatarPath ? <ProjectMedia path={review.avatarPath} alt="" className="size-12 shrink-0 rounded-full" /> : <div aria-hidden="true" className="size-12 shrink-0 rounded-full bg-surface-elevated" />}
              <div className="min-w-0"><Heading level={2}>{review.reviewerName}</Heading>{review.reviewerRole && <Text variant="muted">{localized(review.reviewerRole, locale)}</Text>}</div>
            </div>
            <div aria-label={t('reviews_rating', { rating: review.rating })} className="text-accent" role="img">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
            <Text className="whitespace-pre-wrap">{localized(review.content, locale)}</Text>
          </Surface>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import type { Review } from '../../data/types.ts'
import { changeReviewStatus, deleteReview, listReviews, saveReview } from './reviews.ts'
import { useI18n } from '../../i18n/context.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Heading } from '../../components/ui/Heading.tsx'
import { Text } from '../../components/ui/Text.tsx'

type RecordType = Review & { id: string }
const blank = (id: string): RecordType => ({
  id, reviewerName: '', reviewerRole: { en: '', ar: '' }, rating: 5, content: { en: '', ar: '' },
  avatarPath: null, relatedServiceId: null, relatedProjectId: null, status: 'pending',
  publishedAt: null, order: 0, createdAt: {} as Review['createdAt'], updatedAt: {} as Review['updatedAt'],
})

export default function ReviewsAdmin() {
  const { t } = useI18n()
  const [items, setItems] = useState<RecordType[]>([])
  const [editing, setEditing] = useState<RecordType | null>(null)
  const [error, setError] = useState('')
  const reload = () => listReviews(true).then(r => setItems(r.items)).catch(() => setError(t('cms_load_error')))
  useEffect(() => { void reload() }, [])

  const save = async () => {
    if (!editing) return
    try {
      await saveReview(editing.id, {
        reviewerName: editing.reviewerName.trim(), reviewerRole: editing.reviewerRole, rating: editing.rating,
        content: editing.content, avatarPath: editing.avatarPath, relatedServiceId: editing.relatedServiceId,
        relatedProjectId: editing.relatedProjectId, status: editing.status, publishedAt: editing.publishedAt, order: editing.order,
      }, editing.updatedAt)
      setEditing(null); await reload()
    } catch (e) { setError(e instanceof Error ? e.message : t('cms_save_error')) }
  }
  const transition = async (item: RecordType, status: Review['status']) => {
    try { await changeReviewStatus(item.id, status, item.updatedAt); await reload() }
    catch (e) { setError(e instanceof Error ? e.message : t('cms_save_error')) }
  }

  return <div className="grid gap-6">
    <header><Heading level={1}>{t('route_reviews')}</Heading><Text variant="muted">{t('cms_reviews_subtitle')}</Text></header>
    {error && <Surface role="alert"><Text variant="muted">{error}</Text></Surface>}
    <Button onClick={() => setEditing(blank('review-' + Date.now()))}>{t('cms_add_review')}</Button>
    {editing && <Surface className="grid gap-4">
      <input className="field" placeholder={t('cms_reviewer_name')} value={editing.reviewerName} onChange={e => setEditing({...editing, reviewerName:e.target.value})} />
      <input className="field" placeholder={t('cms_role_en')} value={editing.reviewerRole?.en ?? ''} onChange={e => setEditing({...editing, reviewerRole:{en:e.target.value, ar:editing.reviewerRole?.ar ?? ''}})} />
      <input className="field" placeholder={t('cms_role_ar')} value={editing.reviewerRole?.ar ?? ''} onChange={e => setEditing({...editing, reviewerRole:{en:editing.reviewerRole?.en ?? '', ar:e.target.value}})} />
      <textarea className="field min-h-28" placeholder={t('cms_review_en')} value={editing.content.en} onChange={e => setEditing({...editing, content:{...editing.content,en:e.target.value}})} />
      <textarea className="field min-h-28" placeholder={t('cms_review_ar')} value={editing.content.ar} onChange={e => setEditing({...editing, content:{...editing.content,ar:e.target.value}})} />
      <div className="grid gap-2 sm:grid-cols-2">
        <input className="field" type="number" min={1} max={5} value={editing.rating} onChange={e => setEditing({...editing,rating:Number(e.target.value)})} />
        <input className="field" type="number" min={0} value={editing.order} onChange={e => setEditing({...editing,order:Number(e.target.value)})} />
      </div>
      <div className="flex flex-wrap gap-3"><Button onClick={() => void save()}>{t('cms_save')}</Button><Button variant="ghost" onClick={() => setEditing(null)}>{t('cms_cancel')}</Button></div>
    </Surface>}
    <div className="grid gap-4">{items.map(item => <Surface as="article" key={item.id} className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3"><Heading level={2}>{item.reviewerName}</Heading><Text variant="subtle">{item.status} · {item.rating}/5</Text></div>
      <Text variant="muted">{item.content.en}</Text>
      <div className="flex flex-wrap gap-2">
        {item.status === 'pending' && <Button size="sm" onClick={() => void transition(item,'approved')}>{t('cms_approve')}</Button>}
        {item.status === 'approved' && <Button size="sm" onClick={() => void transition(item,'published')}>{t('cms_publish')}</Button>}
        {item.status === 'published' && <Button size="sm" variant="outline" onClick={() => void transition(item,'approved')}>{t('cms_unpublish')}</Button>}
        <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>{t('cms_edit')}</Button>
        <Button size="sm" variant="ghost" onClick={() => window.confirm(t('cms_confirm_delete')) && void deleteReview(item.id).then(reload)}>{t('cms_delete')}</Button>
      </div>
    </Surface>)}</div>
  </div>
}

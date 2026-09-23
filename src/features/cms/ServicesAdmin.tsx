import { useEffect, useState, type FormEvent } from 'react'
import type { Service, ServiceInput } from '../../data/index.ts'
import { useI18n } from '../../i18n/context.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Field, inputClass, textareaClass, SaveState } from './fields.tsx'
import { deleteService, listServices, saveService } from './data.ts'
import { getErrorMessage } from './errors.ts'

const blank: ServiceInput = {
  title: { en: '', ar: '' },
  slug: '',
  summary: { en: '', ar: '' },
  description: { en: '', ar: '' },
  iconPath: null,
  published: false,
  order: 0,
}

export default function ServicesAdmin() {
  const { t } = useI18n()
  const [items, setItems] = useState<Service[]>([])
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceInput>(blank)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [invalidCount, setInvalidCount] = useState(0)

  async function load() {
    setLoading(true); setError('')
    try {
      const result = await listServices(false)
      setItems(result.items); setInvalidCount(result.invalidCount)
    } catch { setError(t('cms_load_error')) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  function edit(item: Service) {
    setEditing(item)
    setForm({ title: item.title, slug: item.slug, summary: item.summary, description: item.description, iconPath: item.iconPath, published: item.published, order: item.order })
    setSaved(''); setError('')
  }
  function reset() { setEditing(null); setForm(blank); setSaved(''); setError('') }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setSaved('')
    try {
      await saveService(form, editing?.updatedAt)
      setSaved(t('cms_saved')); reset(); await load()
    } catch (cause) { setError(getErrorMessage(cause, t('cms_save_error'))) }
    finally { setBusy(false) }
  }

  async function remove(item: Service) {
    if (!window.confirm(t('cms_confirm_delete'))) return
    setBusy(true); setError('')
    try { await deleteService(item); if (editing?.slug === item.slug) reset(); await load() }
    catch (cause) { setError(getErrorMessage(cause, t('cms_delete_error'))) }
    finally { setBusy(false) }
  }

  return (
    <div className="grid gap-6">
      <Heading title={t('route_services')} subtitle={t('cms_services_subtitle')} />
      <SaveState message={saved} error={error} />
      {invalidCount > 0 && <p role="alert" className="text-body text-danger">{t('cms_invalid_items', { count: invalidCount })}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <Surface as="section" padding="lg">
          <div className="grid gap-4">
            {loading ? <p className="text-body text-foreground-muted">{t('loading_label')}</p> :
              items.length === 0 ? <p className="text-body text-foreground-muted">{t('cms_empty_services')}</p> :
              items.map((item) => (
                <article key={item.slug} className="grid gap-3 rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="text-h3 font-semibold text-foreground">{item.title.en}</h2><p className="text-body text-foreground-muted">{item.summary.en}</p></div>
                    <span className="text-caption text-foreground-subtle">{item.published ? t('cms_published') : t('cms_draft')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => edit(item)}>{t('cms_edit')}</Button><Button size="sm" variant="ghost" onClick={() => void remove(item)} disabled={busy}>{t('cms_delete')}</Button></div>
                </article>
              ))}
          </div>
        </Surface>
        <Surface as="section" padding="lg">
          <form className="grid gap-4" onSubmit={submit}>
            <h2 className="text-h3 font-semibold text-foreground">{editing ? t('cms_edit') : t('cms_add_service')}</h2>
            <Field label={t('cms_title_en')} htmlFor="service-title-en"><input id="service-title-en" className={inputClass} value={form.title.en} onChange={e => setForm({...form,title:{...form.title,en:e.target.value}})} required /></Field>
            <Field label={t('cms_title_ar')} htmlFor="service-title-ar"><input id="service-title-ar" dir="rtl" className={inputClass} value={form.title.ar} onChange={e => setForm({...form,title:{...form.title,ar:e.target.value}})} /></Field>
            <Field label={t('cms_slug')} htmlFor="service-slug"><input id="service-slug" className={inputClass} value={form.slug} onChange={e => setForm({...form,slug:e.target.value})} required disabled={Boolean(editing)} /></Field>
            <Field label={t('cms_summary_en')} htmlFor="service-summary-en"><textarea id="service-summary-en" className={textareaClass} value={form.summary.en} onChange={e => setForm({...form,summary:{...form.summary,en:e.target.value}})} required /></Field>
            <Field label={t('cms_summary_ar')} htmlFor="service-summary-ar"><textarea id="service-summary-ar" dir="rtl" className={textareaClass} value={form.summary.ar} onChange={e => setForm({...form,summary:{...form.summary,ar:e.target.value}})} /></Field>
            <Field label={t('cms_description_en')} htmlFor="service-description-en"><textarea id="service-description-en" className={textareaClass} value={form.description.en} onChange={e => setForm({...form,description:{...form.description,en:e.target.value}})} required /></Field>
            <Field label={t('cms_description_ar')} htmlFor="service-description-ar"><textarea id="service-description-ar" dir="rtl" className={textareaClass} value={form.description.ar} onChange={e => setForm({...form,description:{...form.description,ar:e.target.value}})} /></Field>
            <Field label={t('cms_icon_path')} htmlFor="service-icon"><input id="service-icon" className={inputClass} value={form.iconPath ?? ''} onChange={e => setForm({...form,iconPath:e.target.value||null})} /></Field>
            <Field label={t('cms_order')} htmlFor="service-order"><input id="service-order" type="number" min="0" max="100000" className={inputClass} value={form.order} onChange={e => setForm({...form,order:Number(e.target.value)})} required /></Field>
            <label className="flex items-center gap-3 text-body text-foreground"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/>{t('cms_published')}</label>
            <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy}>{busy ? t('cms_saving') : t('cms_save')}</Button><Button type="button" variant="outline" onClick={reset} disabled={busy}>{t('cms_cancel')}</Button></div>
          </form>
        </Surface>
      </div>
    </div>
  )
}

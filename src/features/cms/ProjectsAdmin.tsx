import { useEffect, useState, type FormEvent } from 'react'
import type { ProjectInput } from '../../data/index.ts'
import { useI18n } from '../../i18n/context.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Field, inputClass, textareaClass, SaveState } from './fields.tsx'
import { deleteProject, getFeaturedProjectId, listProjects, publishProject, saveProject, setFeaturedProject, uploadProjectMedia, type ProjectRecord } from './projects.ts'
import { getErrorMessage } from './errors.ts'

const blank: ProjectInput = {
  title: { en: '', ar: '' },
  slug: '',
  summary: { en: '', ar: '' },
  description: { en: '', ar: '' },
  caseStudy: null,
  technologies: [],
  category: null,
  thumbnailPath: null,
  galleryPaths: [],
  liveUrl: null,
  repoUrl: null,
  links: [],
  seo: { title: null, description: null },
  published: false,
  order: 0,
}

function localizedValue(value: { en: string; ar: string }, locale: 'en' | 'ar') {
  return locale === 'ar' && value.ar ? value.ar : value.en
}

export default function ProjectsAdmin() {
  const { t, locale } = useI18n()
  const [items, setItems] = useState<ProjectRecord[]>([])
  const [editing, setEditing] = useState<ProjectRecord | null>(null)
  const [form, setForm] = useState<ProjectInput>(blank)
  const [featuredId, setFeaturedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [invalidCount, setInvalidCount] = useState(0)
  const [uploading, setUploading] = useState(false)

  async function load() {
    setLoading(true); setError('')
    try {
      const [projects, featured] = await Promise.all([listProjects(false), getFeaturedProjectId()])
      setItems(projects.items); setInvalidCount(projects.invalidCount); setFeaturedId(featured)
    } catch (cause) {
      setError(getErrorMessage(cause, t('cms_load_error')))
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  function edit(item: ProjectRecord) {
    setEditing(item)
    setForm({
      title: item.title, slug: item.slug, summary: item.summary, description: item.description,
      caseStudy: item.caseStudy, technologies: item.technologies, category: item.category,
      thumbnailPath: item.thumbnailPath, galleryPaths: item.galleryPaths, liveUrl: item.liveUrl,
      repoUrl: item.repoUrl, links: item.links, seo: item.seo, published: item.published, order: item.order,
    })
    setError(''); setSaved('')
  }

  function reset() { setEditing(null); setForm(blank); setError(''); setSaved('') }

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setError(''); setSaved('')
    try {
      if (!form.slug) throw new Error(t('cms_project_slug_required'))
      if (form.published) {
        if (!editing && !form.thumbnailPath) throw new Error(t('cms_project_thumbnail_required'))
        await publishProject(editing ?? ({ id: form.slug, ...form, createdAt: undefined, updatedAt: undefined } as unknown as ProjectRecord), form)
      } else if (editing) {
        await publishProject(editing, form)
      } else {
        await saveProject(form)
      }
      reset(); setSaved(t('cms_saved')); await load()
    } catch (cause) {
      setError(getErrorMessage(cause, t('cms_save_error')))
    } finally { setBusy(false) }
  }

  async function upload(kind: 'thumbnail' | 'gallery', files: FileList | null) {
    if (!files?.length || !form.slug) {
      if (!form.slug) setError(t('cms_project_slug_required_before_media'))
      return
    }
    setUploading(true); setError('')
    try {
      const next = [...form.galleryPaths]
      let thumbnail = form.thumbnailPath
      for (const file of Array.from(files)) {
        const result = await uploadProjectMedia(form.slug, kind, file)
        if (kind === 'thumbnail') thumbnail = result.path
        else next.push(result.path)
      }
      if (next.length > 12) throw new Error(t('cms_project_gallery_limit'))
      setForm({ ...form, thumbnailPath: thumbnail, galleryPaths: next })
    } catch (cause) {
      setError(getErrorMessage(cause, t('cms_upload_error')))
    } finally { setUploading(false) }
  }

  async function chooseFeatured() {
    if (!editing || !form.published) return
    setBusy(true); setError('')
    try { await setFeaturedProject(editing.id); setFeaturedId(editing.id); setSaved(t('cms_featured_saved')) }
    catch (cause) { setError(getErrorMessage(cause, t('cms_featured_error'))) }
    finally { setBusy(false) }
  }

  async function clearFeatured() {
    setBusy(true); setError('')
    try { await setFeaturedProject(null); setFeaturedId(null); setSaved(t('cms_featured_cleared')) }
    catch (cause) { setError(getErrorMessage(cause, t('cms_featured_error'))) }
    finally { setBusy(false) }
  }

  async function remove(item: ProjectRecord) {
    if (!window.confirm(t('cms_confirm_delete'))) return
    setBusy(true); setError('')
    try {
      if (featuredId === item.id) await setFeaturedProject(null)
      await deleteProject(item)
      if (editing?.id === item.id) reset()
      await load()
    } catch (cause) { setError(getErrorMessage(cause, t('cms_delete_error'))) }
    finally { setBusy(false) }
  }

  return <div className="grid gap-6">
    <div className="grid gap-2"><Heading>{t('route_projects')}</Heading><p className="text-body text-foreground-muted">{t('cms_projects_subtitle')}</p></div>
    <SaveState message={saved} error={error} />
    {invalidCount > 0 && <p role="alert" className="text-body text-danger">{t('cms_invalid_items', { count: invalidCount })}</p>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
      <Surface as="section" padding="lg"><div className="grid gap-4">
        {loading ? <p className="text-body text-foreground-muted">{t('loading_label')}</p> :
          items.length === 0 ? <p className="text-body text-foreground-muted">{t('cms_empty_projects')}</p> :
          items.map(item => <article key={item.id} className="grid gap-3 rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-h3 font-semibold text-foreground">{localizedValue(item.title, locale)}</h2><p className="text-caption text-foreground-muted">{item.slug}</p></div>
              <div className="flex gap-2"><span className="text-caption text-foreground-subtle">{item.published ? t('cms_published') : t('cms_draft')}</span>{featuredId === item.id && <span className="text-caption text-accent">{t('cms_featured')}</span>}</div>
            </div>
            <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => edit(item)}>{t('cms_edit')}</Button><Button size="sm" variant="ghost" onClick={() => void remove(item)} disabled={busy}>{t('cms_delete')}</Button></div>
          </article>)}
      </div></Surface>
      <Surface as="section" padding="lg"><form className="grid gap-4" onSubmit={save}>
        <h2 className="text-h3 font-semibold text-foreground">{editing ? t('cms_edit') : t('cms_add_project')}</h2>
        <Field label={t('cms_title_en')} htmlFor="project-title-en"><input id="project-title-en" className={inputClass} value={form.title.en} onChange={e => setForm({...form,title:{...form.title,en:e.target.value}})} required /></Field>
        <Field label={t('cms_title_ar')} htmlFor="project-title-ar"><input id="project-title-ar" dir="rtl" className={inputClass} value={form.title.ar} onChange={e => setForm({...form,title:{...form.title,ar:e.target.value}})} /></Field>
        <Field label={t('cms_slug')} htmlFor="project-slug"><input id="project-slug" className={inputClass} value={form.slug} onChange={e => setForm({...form,slug:e.target.value})} required disabled={Boolean(editing)} /></Field>
        <Field label={t('cms_summary_en')} htmlFor="project-summary-en"><textarea id="project-summary-en" className={textareaClass} value={form.summary.en} onChange={e => setForm({...form,summary:{...form.summary,en:e.target.value}})} required /></Field>
        <Field label={t('cms_summary_ar')} htmlFor="project-summary-ar"><textarea id="project-summary-ar" dir="rtl" className={textareaClass} value={form.summary.ar} onChange={e => setForm({...form,summary:{...form.summary,ar:e.target.value}})} /></Field>
        <Field label={t('cms_description_en')} htmlFor="project-description-en"><textarea id="project-description-en" className={textareaClass} value={form.description.en} onChange={e => setForm({...form,description:{...form.description,en:e.target.value}})} required /></Field>
        <Field label={t('cms_description_ar')} htmlFor="project-description-ar"><textarea id="project-description-ar" dir="rtl" className={textareaClass} value={form.description.ar} onChange={e => setForm({...form,description:{...form.description,ar:e.target.value}})} /></Field>
        <Field label={t('cms_case_study')} htmlFor="project-case-study"><textarea id="project-case-study" className={textareaClass} value={form.caseStudy?.en ?? ''} onChange={e => setForm({...form,caseStudy:{en:e.target.value,ar:form.caseStudy?.ar ?? ''}})} /></Field>
        <Field label={t('cms_technologies')} htmlFor="project-technologies"><input id="project-technologies" className={inputClass} value={form.technologies.join(', ')} onChange={e => setForm({...form,technologies:e.target.value.split(',').map(v=>v.trim()).filter(Boolean)})} /></Field>
        <Field label={t('cms_category')} htmlFor="project-category"><input id="project-category" className={inputClass} value={form.category ?? ''} onChange={e => setForm({...form,category:e.target.value||null})} /></Field>
        <Field label={t('cms_thumbnail')} htmlFor="project-thumbnail"><input id="project-thumbnail" type="file" accept="image/png,image/jpeg,image/webp,image/avif" className={inputClass} onChange={e => void upload('thumbnail', e.target.files)} disabled={uploading || !form.slug} /><p className="text-caption text-foreground-muted">{form.thumbnailPath ?? t('cms_no_media')}</p></Field>
        <Field label={t('cms_gallery')} htmlFor="project-gallery"><input id="project-gallery" type="file" multiple accept="image/png,image/jpeg,image/webp,image/avif" className={inputClass} onChange={e => void upload('gallery', e.target.files)} disabled={uploading || !form.slug} /><p className="text-caption text-foreground-muted">{t('cms_gallery_count', { count: form.galleryPaths.length })}</p></Field>
        <Field label={t('cms_live_url')} htmlFor="project-live-url"><input id="project-live-url" type="url" className={inputClass} value={form.liveUrl ?? ''} onChange={e => setForm({...form,liveUrl:e.target.value||null})} /></Field>
        <Field label={t('cms_repo_url')} htmlFor="project-repo-url"><input id="project-repo-url" type="url" className={inputClass} value={form.repoUrl ?? ''} onChange={e => setForm({...form,repoUrl:e.target.value||null})} /></Field>
        <Field label={t('cms_order')} htmlFor="project-order"><input id="project-order" type="number" min="0" max="100000" className={inputClass} value={form.order} onChange={e => setForm({...form,order:Number(e.target.value)})} /></Field>
        <label className="flex items-center gap-3 text-body text-foreground"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/>{t('cms_published')}</label>
        {editing && <div className="flex flex-wrap gap-2">{featuredId === editing.id ? <Button type="button" variant="outline" onClick={()=>void clearFeatured()} disabled={busy}>{t('cms_clear_featured')}</Button> : <Button type="button" variant="outline" onClick={()=>void chooseFeatured()} disabled={busy || !form.published}>{t('cms_set_featured')}</Button>}</div>}
        <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy || uploading}>{busy?t('cms_saving'):t('cms_save')}</Button><Button type="button" variant="outline" onClick={reset} disabled={busy}>{t('cms_cancel')}</Button></div>
      </form></Surface>
    </div>
  </div>
}

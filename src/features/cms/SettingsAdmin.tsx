import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { SiteSettings, SiteSettingsInput } from '../../data/types.ts'
import { useI18n } from '../../i18n/context.ts'
import { Button } from '../../components/ui/Button.tsx'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'
import { Field, inputClass, textareaClass, SaveState } from './fields.tsx'
import { getSiteSettings, saveSiteSettings } from './settings.ts'
import { getFeaturedProjectId } from './projects.ts'
import { getErrorMessage } from './errors.ts'

const blank: SiteSettingsInput = {
  siteTitle: { en: '', ar: '' },
  siteDescription: { en: '', ar: '' },
  defaultLocale: 'en',
  featuredProjectId: null,
}

export default function SettingsAdmin() {
  const { t } = useI18n()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [form, setForm] = useState<SiteSettingsInput>(blank)
  const [featuredProjectId, setFeaturedProjectId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const [value, featured] = await Promise.all([getSiteSettings(), getFeaturedProjectId()])
      setSettings(value)
      setFeaturedProjectId(featured)
      if (value) {
        setForm({
          siteTitle: value.siteTitle,
          siteDescription: value.siteDescription,
          defaultLocale: value.defaultLocale,
          featuredProjectId: value.featuredProjectId,
        })
      } else {
        setForm(blank)
      }
    } catch (cause) {
      setError(getErrorMessage(cause, t('cms_load_error')))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true); setError(''); setSaved('')
    try {
      await saveSiteSettings({ ...form, featuredProjectId }, settings?.updatedAt)
      setSaved(t('cms_saved'))
      await load()
    } catch (cause) {
      setError(getErrorMessage(cause, t('cms_save_error')))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Heading level={1}>{t('route_settings')}</Heading>
        <Text variant="muted">{t('admin_settings_subtitle')}</Text>
      </div>
      <Surface as="section" padding="lg">
        <form className="grid gap-6" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('admin_site_title_en')} htmlFor="settings-title-en">
              <input id="settings-title-en" className={inputClass} value={form.siteTitle.en} onChange={e => setForm({...form, siteTitle:{...form.siteTitle,en:e.target.value}})} required />
            </Field>
            <Field label={t('admin_site_title_ar')} htmlFor="settings-title-ar">
              <input id="settings-title-ar" dir="rtl" className={inputClass} value={form.siteTitle.ar} onChange={e => setForm({...form, siteTitle:{...form.siteTitle,ar:e.target.value}})} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('admin_site_description_en')} htmlFor="settings-description-en">
              <textarea id="settings-description-en" className={textareaClass} value={form.siteDescription.en} onChange={e => setForm({...form,siteDescription:{...form.siteDescription,en:e.target.value}})} required />
            </Field>
            <Field label={t('admin_site_description_ar')} htmlFor="settings-description-ar">
              <textarea id="settings-description-ar" dir="rtl" className={textareaClass} value={form.siteDescription.ar} onChange={e => setForm({...form,siteDescription:{...form.siteDescription,ar:e.target.value}})} />
            </Field>
          </div>
          <Field label={t('admin_default_locale')} htmlFor="settings-locale">
            <select id="settings-locale" className={inputClass} value={form.defaultLocale} onChange={e => setForm({...form,defaultLocale:e.target.value as SiteSettingsInput['defaultLocale']})}>
              <option value="en">{t('locale_english')}</option>
              <option value="ar">{t('locale_arabic')}</option>
            </select>
          </Field>
          <div className="grid gap-2 rounded-lg border border-border p-4">
            <Heading level={2}>{t('admin_featured_setting')}</Heading>
            <Text variant="muted">{featuredProjectId ?? t('admin_status_missing')}</Text>
            <Text variant="muted">{t('admin_featured_setting_help')}</Text>
            <Link to="/admin/projects" className="text-sm font-medium text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{t('admin_manage_featured')}</Link>
          </div>
          <SaveState message={saved} error={error} />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={busy}>{busy ? t('cms_saving') : t('cms_save')}</Button>
            <Button type="button" variant="outline" onClick={() => void load()} disabled={busy}>{t('cms_reload')}</Button>
          </div>
        </form>
      </Surface>
    </div>
  )
}

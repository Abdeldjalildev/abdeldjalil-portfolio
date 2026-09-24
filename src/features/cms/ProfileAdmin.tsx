import { useEffect, useState, type FormEvent } from 'react'
import type { Profile, ProfileInput } from '../../data/index.ts'
import { useI18n } from '../../i18n/context.ts'
import { Surface } from '../../components/ui/Surface.tsx'
import { Heading } from '../../components/ui/Heading.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Field, inputClass, textareaClass, SaveState } from './fields.tsx'
import { getAdminProfile, saveProfile } from './data.ts'
import { getErrorMessage } from './errors.ts'

const emptyProfile: ProfileInput = {
  fullName: { en: '', ar: '' },
  headline: { en: '', ar: '' },
  bio: { en: '', ar: '' },
  avatarPath: null,
  resumePath: null,
  published: true,
}

export default function ProfileAdmin() {
  const { t } = useI18n()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<ProfileInput>(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const value = await getAdminProfile()
      setProfile(value)
      if (value) {
        setForm({
          fullName: value.fullName,
          headline: value.headline,
          bio: value.bio,
          avatarPath: value.avatarPath,
          resumePath: value.resumePath,
          published: value.published,
        })
      }
    } catch {
      setError(t('cms_load_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true); setError(''); setSaved('')
    try {
      await saveProfile(form, profile?.updatedAt)
      setSaved(t('cms_saved'))
      await load()
    } catch (cause) {
      setError(getErrorMessage(cause, t('cms_save_error')))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>
  if (!profile && !form.fullName.en) {
    // The singleton may not exist yet; the admin may create it through the same editor.
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2"><Heading level={1}>{t('route_profile')}</Heading><p className="text-body text-foreground-muted">{t('cms_profile_subtitle')}</p></div>
      <Surface as="section" padding="lg">
        <form className="grid gap-6" onSubmit={submit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('cms_full_name_en')} htmlFor="profile-name-en"><input id="profile-name-en" className={inputClass} value={form.fullName.en} onChange={(e) => setForm({ ...form, fullName: { ...form.fullName, en: e.target.value } })} required /></Field>
            <Field label={t('cms_full_name_ar')} htmlFor="profile-name-ar"><input id="profile-name-ar" dir="rtl" className={inputClass} value={form.fullName.ar} onChange={(e) => setForm({ ...form, fullName: { ...form.fullName, ar: e.target.value } })} /></Field>
            <Field label={t('cms_headline_en')} htmlFor="profile-headline-en"><input id="profile-headline-en" className={inputClass} value={form.headline.en} onChange={(e) => setForm({ ...form, headline: { ...form.headline, en: e.target.value } })} required /></Field>
            <Field label={t('cms_headline_ar')} htmlFor="profile-headline-ar"><input id="profile-headline-ar" dir="rtl" className={inputClass} value={form.headline.ar} onChange={(e) => setForm({ ...form, headline: { ...form.headline, ar: e.target.value } })} /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('cms_bio_en')} htmlFor="profile-bio-en"><textarea id="profile-bio-en" className={textareaClass} value={form.bio.en} onChange={(e) => setForm({ ...form, bio: { ...form.bio, en: e.target.value } })} required /></Field>
            <Field label={t('cms_bio_ar')} htmlFor="profile-bio-ar"><textarea id="profile-bio-ar" dir="rtl" className={textareaClass} value={form.bio.ar} onChange={(e) => setForm({ ...form, bio: { ...form.bio, ar: e.target.value } })} /></Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t('cms_avatar_path')} htmlFor="profile-avatar"><input id="profile-avatar" className={inputClass} value={form.avatarPath ?? ''} onChange={(e) => setForm({ ...form, avatarPath: e.target.value || null })} /></Field>
            <Field label={t('cms_resume_path')} htmlFor="profile-resume"><input id="profile-resume" className={inputClass} value={form.resumePath ?? ''} onChange={(e) => setForm({ ...form, resumePath: e.target.value || null })} /></Field>
          </div>
          <label className="flex items-center gap-3 text-body text-foreground">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            {t('cms_published')}
          </label>
          <SaveState message={saved} error={error} />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>{saving ? t('cms_saving') : t('cms_save')}</Button>
            <Button type="button" variant="outline" onClick={() => void load()} disabled={saving}>{t('cms_reload')}</Button>
          </div>
        </form>
      </Surface>
    </div>
  )
}

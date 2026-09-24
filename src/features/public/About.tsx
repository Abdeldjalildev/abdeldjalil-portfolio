import { useEffect, useState } from 'react'
import type { Profile, Skill } from '../../data/index.ts'
import { getPublicProfile, listSkills } from '../cms/data.ts'
import { useI18n } from '../../i18n/context.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'

export default function About() {
  const { t, locale } = useI18n()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([getPublicProfile(), listSkills(true)]).then(([profileResult, skillResult]) => {
      if (!active) return
      setProfile(profileResult)
      setSkills(skillResult.items)
    }).catch(() => { if (active) setError(true) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>
  if (error) return <Surface role="alert"><p className="text-body text-danger">{t('cms_public_error')}</p></Surface>
  if (!profile) return <Surface><p className="text-body text-foreground-muted">{t('cms_empty_profile')}</p></Surface>

  const localized = (value: { en: string; ar: string }) => locale === 'ar' && value.ar ? value.ar : value.en
  return <div className="grid gap-8">
    <div className="grid gap-2"><Heading>{localized(profile.fullName)}</Heading><p className="text-body text-foreground-muted">{localized(profile.headline)}</p></div>
    <Surface as="section" padding="lg">
      <Text variant="lead" className="whitespace-pre-wrap">{localized(profile.bio)}</Text>
    </Surface>
    {skills.length>0 && <section className="grid gap-4"><Heading>{t('route_skills')}</Heading><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{skills.map(skill=><Surface key={skill.name} padding="md"><h2 className="font-semibold text-foreground">{skill.name}</h2><p className="text-caption text-foreground-muted">{t(`skill_group_${skill.group}` as Parameters<typeof t>[0])}</p></Surface>)}</div></section>}
  </div>
}

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Project } from '../../data/types.ts'
import { getPublishedProject } from '../cms/projects.ts'
import { useI18n } from '../../i18n/context.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'
import { ProjectDetails } from './ProjectDetails.tsx'
import {
  getProjectSeoDescription,
  getProjectSeoTitle,
} from './projectPresentation.ts'

type ProjectRecord = Project & { id: string }

export default function ProjectDetail() {
  const { slug } = useParams()
  const { locale, t } = useI18n()
  const [project, setProject] = useState<ProjectRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    if (!slug) {
      setLoading(false)
      return
    }

    getPublishedProject(slug)
      .then(result => {
        if (!active) return
        setProject(result)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    if (!project) return

    const previousTitle = document.title
    const title = getProjectSeoTitle(project, locale)
    const description = getProjectSeoDescription(project, locale)
    const descriptionMeta = document.querySelector('meta[name="description"]')
    const previousDescription = descriptionMeta?.getAttribute('content') ?? null

    document.title = title
    descriptionMeta?.setAttribute('content', description)

    return () => {
      document.title = previousTitle
      if (descriptionMeta && previousDescription !== null) {
        descriptionMeta.setAttribute('content', previousDescription)
      }
    }
  }, [project, locale])

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>
  if (error) {
    return (
      <Surface role="alert">
        <Heading level={1}>{t('projects_load_error_title')}</Heading>
        <Text variant="muted">{t('cms_public_error')}</Text>
        <Link to="/projects" className="text-accent underline-offset-4 hover:underline">
          {t('projects_back')}
        </Link>
      </Surface>
    )
  }
  if (!project) {
    return (
      <Surface>
        <Heading level={1}>{t('projects_not_found_title')}</Heading>
        <Text variant="muted">{t('projects_not_found_message')}</Text>
        <Link to="/projects" className="text-accent underline-offset-4 hover:underline">
          {t('projects_back')}
        </Link>
      </Surface>
    )
  }

  return <ProjectDetails project={project} />
}

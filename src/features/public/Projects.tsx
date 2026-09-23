import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Project } from '../../data/types.ts'
import { listProjects } from '../cms/projects.ts'
import { useI18n } from '../../i18n/context.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'
import { ProjectCard } from './ProjectCard.tsx'
import { ProjectDetails } from './ProjectDetails.tsx'

type ProjectRecord = Project & { id: string }

export default function Projects() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [invalidCount, setInvalidCount] = useState(0)

  useEffect(() => {
    let active = true
    listProjects(true)
      .then(result => {
        if (!active) return
        setItems(result.items)
        setInvalidCount(result.invalidCount)
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
  }, [])

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>
  if (error) {
    return (
      <Surface role="alert">
        <p className="text-body text-danger">{t('cms_public_error')}</p>
      </Surface>
    )
  }

  if (items.length === 0) {
    return (
      <div className="grid gap-3">
        <Heading level={1}>{t('route_projects')}</Heading>
        <Surface>
          <Text variant="muted">{t('projects_empty')}</Text>
        </Surface>
      </div>
    )
  }

  const requestedSlug = searchParams.get('project')
  const selected = items.find(item => item.slug === requestedSlug) ?? items[0]

  const selectProject = (slug: string) => {
    setSearchParams({ project: slug }, { replace: true })
  }

  return (
    <div className="grid gap-8">
      <header className="grid gap-2">
        <Heading level={1}>{t('projects_title')}</Heading>
        <Text variant="lead">{t('projects_subtitle')}</Text>
      </header>

      {invalidCount > 0 && (
        <p role="status" className="text-caption text-foreground-muted">
          {t('cms_invalid_items', { count: invalidCount })}
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <section className="grid gap-4" aria-labelledby="projects-list-heading">
          <Heading level={2} id="projects-list-heading">{t('projects_all')}</Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {items.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                selected={project.id === selected.id}
                onSelect={selectProject}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:sticky lg:top-6" aria-labelledby="projects-selected-heading">
          <Heading level={2} id="projects-selected-heading">{t('projects_selected')}</Heading>
          <ProjectDetails project={selected} compact />
          <a
            href={`/projects/${selected.slug}`}
            className="justify-self-start text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {t('projects_view_case_study')}
          </a>
        </section>
      </div>
    </div>
  )
}

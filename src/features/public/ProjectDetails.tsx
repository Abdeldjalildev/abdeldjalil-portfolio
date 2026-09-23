import { Link } from 'react-router-dom'
import type { Project } from '../../data/types.ts'
import { useI18n } from '../../i18n/context.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'
import { ProjectMedia } from './ProjectMedia.tsx'
import { localizeProjectText } from './projectPresentation.ts'

type ProjectDetailsProps = {
  project: Project & { id: string }
  compact?: boolean
}

export function ProjectDetails({ project, compact = false }: ProjectDetailsProps) {
  const { locale, t } = useI18n()
  const title = localizeProjectText(project.title, locale)
  const summary = localizeProjectText(project.summary, locale)
  const description = localizeProjectText(project.description, locale)
  const caseStudy = project.caseStudy ? localizeProjectText(project.caseStudy, locale) : null

  return (
    <Surface as="article" variant="elevated" padding="lg" className="grid gap-7">
      <div className="grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Heading level={compact ? 2 : 1}>{title}</Heading>
          {project.category && (
            <span className="rounded-full border border-border px-2.5 py-1 text-caption text-foreground-muted">
              {project.category}
            </span>
          )}
        </div>
        <Text variant="lead">{summary}</Text>
      </div>

      <ProjectMedia path={project.thumbnailPath} alt={title} priority={!compact} className="aspect-[16/9] rounded-xl" />

      <div className="grid gap-3">
        <Heading level={2}>{t('projects_overview')}</Heading>
        <Text className="whitespace-pre-wrap">{description}</Text>
      </div>

      {project.technologies.length > 0 && (
        <section className="grid gap-3" aria-labelledby={`project-${project.id}-technologies`}>
          <Heading level={2} id={`project-${project.id}-technologies`}>{t('projects_technologies')}</Heading>
          <ul className="flex flex-wrap gap-2">
            {project.technologies.map(technology => (
              <li key={technology} className="rounded-full border border-border px-3 py-1.5 text-caption text-foreground-muted">
                {technology}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!compact && caseStudy && (
        <section className="grid gap-3" aria-labelledby={`project-${project.id}-case-study`}>
          <Heading level={2} id={`project-${project.id}-case-study`}>{t('projects_case_study')}</Heading>
          <Text className="whitespace-pre-wrap">{caseStudy}</Text>
        </section>
      )}

      {!compact && project.galleryPaths.length > 0 && (
        <section className="grid gap-4" aria-labelledby={`project-${project.id}-gallery`}>
          <Heading level={2} id={`project-${project.id}-gallery`}>{t('projects_gallery')}</Heading>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.galleryPaths.map((path, index) => (
              <ProjectMedia
                key={path}
                path={path}
                alt={`${title} — ${t('projects_gallery_image')} ${index + 1}`}
                className="aspect-[16/10] rounded-lg"
              />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-surface transition-standard hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {t('projects_live_demo')}
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border-strong px-4 py-2 text-sm font-semibold text-foreground transition-standard hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {t('projects_repository')}
          </a>
        )}
        {project.links.map(link => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground-muted transition-standard hover:bg-surface-elevated hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {localizeProjectText(link.label, locale)}
          </a>
        ))}
      </div>

      {!compact && (
        <Link
          to="/projects"
          className="text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {t('projects_back')}
        </Link>
      )}
    </Surface>
  )
}

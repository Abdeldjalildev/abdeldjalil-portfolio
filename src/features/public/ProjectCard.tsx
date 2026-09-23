import { Link } from 'react-router-dom'
import type { Project } from '../../data/types.ts'
import { useI18n } from '../../i18n/context.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'
import { ProjectMedia } from './ProjectMedia.tsx'
import { localizeProjectText } from './projectPresentation.ts'

type ProjectCardProps = {
  project: Project & { id: string }
  selected?: boolean
  onSelect?: (slug: string) => void
}

export function ProjectCard({ project, selected = false, onSelect }: ProjectCardProps) {
  const { locale, t } = useI18n()
  const title = localizeProjectText(project.title, locale)
  const summary = localizeProjectText(project.summary, locale)

  const content = (
    <>
      <ProjectMedia
        path={project.thumbnailPath}
        alt={title}
        className="aspect-[16/10] rounded-lg"
      />
      <div className="mt-5 grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Heading level={3}>{title}</Heading>
          {project.category && (
            <span className="rounded-full border border-border px-2.5 py-1 text-caption text-foreground-muted">
              {project.category}
            </span>
          )}
        </div>
        <Text variant="muted">{summary}</Text>
        {project.technologies.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label={t('projects_technologies')}>
            {project.technologies.map(technology => (
              <li
                key={technology}
                className="rounded-full bg-surface-elevated px-2.5 py-1 text-caption text-foreground-muted"
              >
                {technology}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(project.slug)}
        aria-pressed={selected}
        className="block w-full text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <Surface
          as="article"
          variant={selected ? 'elevated' : 'default'}
          padding="md"
          className="h-full transition-standard hover:-translate-y-0.5 hover:border-border-strong"
        >
          {content}
        </Surface>
      </button>
    )
  }

  return (
    <Link
      to={`/projects/${project.slug}`}
      className="block h-full rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <Surface as="article" padding="md" className="h-full transition-standard hover:-translate-y-0.5 hover:border-border-strong">
        {content}
      </Surface>
    </Link>
  )
}

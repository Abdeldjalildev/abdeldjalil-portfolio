import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ContactLink, Profile, Project, Review, Service } from '../data/index.ts'
import { getPublicProfile, listServices } from '../features/cms/data.ts'
import { listProjects, getFeaturedProjectId } from '../features/cms/projects.ts'
import { listReviews } from '../features/cms/reviews.ts'
import { listContactLinks } from '../features/cms/contactLinks.ts'
import { useI18n } from '../i18n/context.ts'
import { Heading } from '../components/ui/Heading.tsx'
import { Surface } from '../components/ui/Surface.tsx'
import { Text } from '../components/ui/Text.tsx'
import { ProjectCard } from '../features/public/ProjectCard.tsx'
import { ProjectDetails } from '../features/public/ProjectDetails.tsx'
import { localizeProjectText } from '../features/public/projectPresentation.ts'

type ProjectRecord = Project & { id: string }
type ReviewRecord = Review & { id: string }
type HomeData = {
  profile: Profile | null
  services: Service[]
  projects: ProjectRecord[]
  featuredProjectId: string | null
  reviews: ReviewRecord[]
  contactLinks: Array<ContactLink & { id: string }>
}

function localized(value: { en: string; ar: string }, locale: 'en' | 'ar') {
  return locale === 'ar' && value.ar ? value.ar : value.en
}

export default function Home() {
  const { locale, t } = useI18n()
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      getPublicProfile(),
      listServices(true),
      listProjects(true),
      getFeaturedProjectId(),
      listReviews(false),
      listContactLinks(false),
    ])
      .then(([profile, services, projects, featuredProjectId, reviews, contactLinks]) => {
        if (!active) return
        setData({
          profile,
          services: services.items,
          projects: projects.items,
          featuredProjectId,
          reviews: reviews.items,
          contactLinks: contactLinks.items,
        })
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

  const featured = useMemo(
    () => data?.projects.find(project => project.id === data.featuredProjectId) ?? null,
    [data],
  )

  const additionalProjects = useMemo(() => {
    if (!data) return []
    return data.projects.filter(project => project.id !== featured?.id)
  }, [data, featured])

  const visibleProjects = showMore ? additionalProjects : additionalProjects.slice(0, 3)

  if (loading) {
    return <p className="py-16 text-body text-foreground-muted">{t('loading_label')}</p>
  }

  if (error || !data) {
    return (
      <Surface role="alert" className="my-8">
        <Heading level={1}>{t('home_load_error_title')}</Heading>
        <Text variant="muted">{t('cms_public_error')}</Text>
      </Surface>
    )
  }

  const average = data.reviews.length
    ? data.reviews.reduce((sum, review) => sum + review.rating, 0) / data.reviews.length
    : 0

  return (
    <div className="grid gap-20 py-8 md:gap-28 md:py-12">
      <section className="grid gap-8 py-10 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] md:items-center">
        <div className="grid gap-6">
          <span className="text-caption font-semibold uppercase tracking-[0.2em] text-accent">
            {t('home_eyebrow')}
          </span>
          <div className="grid gap-4">
            <Heading level={1} className="max-w-4xl text-display">
              {data.profile ? localized(data.profile.headline, locale) : t('home_hero_title')}
            </Heading>
            <Text variant="lead" className="max-w-2xl">
              {data.profile ? localized(data.profile.bio, locale).slice(0, 280) : t('home_hero_subtitle')}
            </Text>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-body font-medium text-accent-foreground shadow-soft transition-standard hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {t('home_projects_cta')}
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border-strong px-5 text-body font-medium text-foreground transition-standard hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {t('home_contact_cta')}
            </Link>
          </div>
        </div>
        <Surface as="aside" variant="elevated" padding="lg" className="grid gap-3">
          <Text variant="muted">{t('home_hero_card_label')}</Text>
          <Heading level={2}>{data.profile ? localized(data.profile.fullName, locale) : 'Abdeldjalil'}</Heading>
          <Text variant="muted">{data.profile ? localized(data.profile.headline, locale) : t('home_hero_subtitle')}</Text>
        </Surface>
      </section>

      <section id="about-preview" className="grid gap-6 md:grid-cols-[0.7fr_1.3fr] md:items-start">
        <div className="grid gap-2">
          <span className="text-caption font-semibold uppercase tracking-[0.2em] text-accent">{t('home_about_eyebrow')}</span>
          <Heading level={2}>{t('nav_about')}</Heading>
        </div>
        <div className="grid gap-5">
          <Text variant="lead" className="whitespace-pre-wrap">
            {data.profile ? localized(data.profile.bio, locale) : t('home_about_empty')}
          </Text>
          <Link to="/about" className="justify-self-start text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            {t('home_about_cta')}
          </Link>
        </div>
      </section>

      <section id="services-preview" className="grid gap-7">
        <div className="grid gap-2">
          <span className="text-caption font-semibold uppercase tracking-[0.2em] text-accent">{t('home_services_eyebrow')}</span>
          <Heading level={2}>{t('nav_services')}</Heading>
        </div>
        {data.services.length === 0 ? (
          <Surface><Text variant="muted">{t('cms_empty_services')}</Text></Surface>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.services.slice(0, 3).map(service => (
              <Surface as="article" key={service.slug} padding="lg" className="grid gap-3">
                <Heading level={3}>{localized(service.title, locale)}</Heading>
                <Text variant="muted">{localized(service.summary, locale)}</Text>
              </Surface>
            ))}
          </div>
        )}
        <Link to="/services" className="justify-self-start text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
          {t('home_services_cta')}
        </Link>
      </section>

      <section id="featured-project" className="grid gap-7">
        <div className="grid gap-2">
          <span className="text-caption font-semibold uppercase tracking-[0.2em] text-accent">{t('home_featured_eyebrow')}</span>
          <Heading level={2}>{t('home_featured_title')}</Heading>
        </div>
        {featured ? (
          <ProjectDetails project={featured} compact />
        ) : (
          <Surface><Text variant="muted">{t('home_featured_empty')}</Text></Surface>
        )}
        {featured && (
          <Link to={`/projects/${featured.slug}`} className="justify-self-start text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            {t('projects_view_case_study')}
          </Link>
        )}
      </section>

      <section id="additional-projects" className="grid gap-7">
        <div className="grid gap-2">
          <span className="text-caption font-semibold uppercase tracking-[0.2em] text-accent">{t('home_projects_eyebrow')}</span>
          <Heading level={2}>{t('projects_all')}</Heading>
        </div>
        {visibleProjects.length === 0 ? (
          <Surface><Text variant="muted">{t('projects_empty')}</Text></Surface>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleProjects.map(project => <ProjectCard key={project.id} project={project} />)}
          </div>
        )}
        {additionalProjects.length > 3 && (
          <button
            type="button"
            onClick={() => setShowMore(value => !value)}
            className="justify-self-start text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {showMore ? t('home_show_less') : t('home_show_more')}
          </button>
        )}
        <Link to="/projects" className="justify-self-start text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
          {t('home_projects_cta')}
        </Link>
      </section>

      <section id="social-proof" className="grid gap-7">
        <div className="grid gap-2">
          <span className="text-caption font-semibold uppercase tracking-[0.2em] text-accent">{t('home_reviews_eyebrow')}</span>
          <Heading level={2}>{t('reviews_title')}</Heading>
        </div>
        {data.reviews.length === 0 ? (
          <Surface><Text variant="muted">{t('reviews_empty')}</Text></Surface>
        ) : (
          <>
            <Surface variant="elevated" padding="lg">
              <Text variant="lead">{t('reviews_average', { average: average.toFixed(1), count: data.reviews.length })}</Text>
            </Surface>
            <div className="grid gap-5 md:grid-cols-2">
              {data.reviews.slice(0, 2).map(review => (
                <Surface as="article" key={review.id} padding="lg" className="grid gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <Heading level={3}>{review.reviewerName}</Heading>
                    <span aria-label={t('reviews_rating', { rating: review.rating })} className="text-accent">
                      {'★'.repeat(review.rating)}
                    </span>
                  </div>
                  <Text className="whitespace-pre-wrap">{localized(review.content, locale)}</Text>
                </Surface>
              ))}
            </div>
          </>
        )}
        <Link to="/reviews" className="justify-self-start text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
          {t('home_reviews_cta')}
        </Link>
      </section>

      <section id="contact-cta" className="grid gap-6">
        <Surface variant="elevated" padding="lg" className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid gap-2">
            <Heading level={2}>{t('home_contact_title')}</Heading>
            <Text variant="muted">{t('home_contact_subtitle')}</Text>
          </div>
          <Link to="/contact" className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-body font-medium text-accent-foreground shadow-soft transition-standard hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            {t('home_contact_cta')}
          </Link>
        </Surface>
        {data.contactLinks.length > 0 && (
          <nav aria-label={t('contact_title')} className="flex flex-wrap gap-3">
            {data.contactLinks.slice(0, 4).map(link => (
              <a
                key={link.id}
                href={link.type === 'email' && !link.value.startsWith('mailto:') ? `mailto:${link.value}` : link.type === 'phone' && !link.value.startsWith('tel:') ? `tel:${link.value}` : link.value}
                target={link.type === 'email' || link.type === 'phone' || link.type === 'whatsapp' ? undefined : '_blank'}
                rel={link.type === 'email' || link.type === 'phone' || link.type === 'whatsapp' ? undefined : 'noopener noreferrer'}
                className="text-sm text-foreground-muted underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {localized(link.label, locale)}
              </a>
            ))}
          </nav>
        )}
      </section>
    </div>
  )
}

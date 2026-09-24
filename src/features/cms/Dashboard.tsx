import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Profile, Service } from '../../data/types.ts'
import { useI18n } from '../../i18n/context.ts'
import { Heading } from '../../components/ui/Heading.tsx'
import { Surface } from '../../components/ui/Surface.tsx'
import { Text } from '../../components/ui/Text.tsx'
import { getAdminProfile, listServices, listSkills } from './data.ts'
import { getFeaturedProjectId, listProjects, type ProjectRecord } from './projects.ts'
import { listReviews, type ReviewRecord } from './reviews.ts'
import { listContactLinks, type ContactLinkRecord } from './contactLinks.ts'
import { getSiteSettings } from './settings.ts'

type DashboardState = {
  profile: Profile | null
  services: Service[]
  skills: Array<{ id: string; name: string }>
  projects: ProjectRecord[]
  reviews: ReviewRecord[]
  contactLinks: ContactLinkRecord[]
  featuredProjectId: string | null
  settingsReady: boolean
  invalidCount: number
}

type SummaryCardProps = {
  label: string
  value: string | number
  to: string
  detail?: string
}

function SummaryCard({ label, value, to, detail }: SummaryCardProps) {
  return (
    <Link to={to} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
      <Surface as="article" variant="elevated" padding="lg" className="grid gap-2 transition-standard hover:border-accent/60">
        <Text variant="muted">{label}</Text>
        <div className="text-display font-semibold text-foreground">{value}</div>
        {detail && <Text variant="muted">{detail}</Text>}
      </Surface>
    </Link>
  )
}

export default function Dashboard() {
  const { t } = useI18n()
  const [state, setState] = useState<DashboardState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      getAdminProfile(),
      listServices(false),
      listSkills(false),
      listProjects(false),
      listReviews(true),
      listContactLinks(true),
      getFeaturedProjectId(),
      getSiteSettings(),
    ])
      .then(([profile, services, skills, projects, reviews, contactLinks, featuredProjectId, settings]) => {
        if (!active) return
        setState({
          profile,
          services: services.items,
          skills: skills.items,
          projects: projects.items,
          reviews: reviews.items,
          contactLinks: contactLinks.items,
          featuredProjectId,
          settingsReady: Boolean(settings),
          invalidCount:
            services.invalidCount +
            skills.invalidCount +
            projects.invalidCount +
            reviews.invalidCount +
            contactLinks.invalidCount,
        })
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  if (loading) return <p className="text-body text-foreground-muted">{t('loading_label')}</p>

  if (error || !state) {
    return (
      <Surface role="alert" variant="elevated" padding="lg">
        <Heading level={1}>{t('admin_dashboard_load_error')}</Heading>
        <Text variant="muted">{t('cms_load_error')}</Text>
      </Surface>
    )
  }

  const publishedProjects = state.projects.filter(item => item.published).length
  const draftProjects = state.projects.length - publishedProjects
  const pendingReviews = state.reviews.filter(item => item.status === 'pending').length
  const approvedReviews = state.reviews.filter(item => item.status === 'approved').length
  const publishedReviews = state.reviews.filter(item => item.status === 'published').length
  const publishedContacts = state.contactLinks.filter(item => item.published).length
  const unpublishedContacts = state.contactLinks.length - publishedContacts
  const featured = state.projects.find(item => item.id === state.featuredProjectId)

  const statuses = [
    {
      label: t('admin_status_profile'),
      value: state.profile?.published ? t('cms_published') : t('admin_status_missing'),
      to: '/admin/profile',
      ok: Boolean(state.profile?.published),
    },
    {
      label: t('admin_status_featured'),
      value: featured ? featured.title.en : t('admin_status_missing'),
      to: '/admin/projects',
      ok: Boolean(featured),
    },
    {
      label: t('admin_status_reviews'),
      value: pendingReviews > 0 ? t('admin_status_pending_count', { count: pendingReviews }) : t('admin_status_clear'),
      to: '/admin/reviews',
      ok: pendingReviews === 0,
    },
    {
      label: t('admin_status_settings'),
      value: state.settingsReady ? t('admin_status_clear') : t('admin_status_missing'),
      to: '/admin/settings',
      ok: state.settingsReady,
    },
    {
      label: t('admin_status_data'),
      value: state.invalidCount > 0 ? t('admin_status_invalid_count', { count: state.invalidCount }) : t('admin_status_clear'),
      to: '/admin',
      ok: state.invalidCount === 0,
    },
  ]

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <span className="text-caption font-semibold uppercase tracking-[0.2em] text-accent">{t('admin_dashboard_eyebrow')}</span>
        <Heading level={1}>{t('route_dashboard')}</Heading>
        <Text variant="muted">{t('admin_dashboard_subtitle')}</Text>
      </div>

      <section className="grid gap-4" aria-labelledby="admin-summary-heading">
        <Heading level={2} id="admin-summary-heading">{t('admin_summary_title')}</Heading>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard label={t('route_projects')} value={state.projects.length} detail={t('admin_project_breakdown', { published: publishedProjects, drafts: draftProjects })} to="/admin/projects" />
          <SummaryCard label={t('route_services')} value={state.services.length} to="/admin/services" />
          <SummaryCard label={t('route_skills')} value={state.skills.length} to="/admin/skills" />
          <SummaryCard label={t('route_reviews')} value={state.reviews.length} detail={t('admin_review_breakdown', { pending: pendingReviews, approved: approvedReviews, published: publishedReviews })} to="/admin/reviews" />
          <SummaryCard label={t('route_contact')} value={state.contactLinks.length} detail={t('admin_contact_breakdown', { published: publishedContacts, drafts: unpublishedContacts })} to="/admin/contact" />
          <SummaryCard label={t('route_profile')} value={state.profile ? t('cms_published') : t('admin_status_missing')} to="/admin/profile" />
          <SummaryCard label={t('route_settings')} value={state.settingsReady ? t('admin_status_clear') : t('admin_status_missing')} to="/admin/settings" />
        </div>
      </section>

      <section className="grid gap-4" aria-labelledby="admin-status-heading">
        <Heading level={2} id="admin-status-heading">{t('admin_operational_status')}</Heading>
        <div className="grid gap-3">
          {statuses.map(status => (
            <Link key={status.label} to={status.to} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-standard hover:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              <div className="grid gap-1">
                <span className="font-medium text-foreground">{status.label}</span>
                <span className="text-sm text-foreground-muted">{status.value}</span>
              </div>
              <span className={status.ok ? 'text-accent' : 'text-danger'} aria-label={status.ok ? t('admin_status_ok') : t('admin_status_attention')}>
                {status.ok ? '✓' : '!'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4" aria-labelledby="admin-quick-heading">
        <Heading level={2} id="admin-quick-heading">{t('admin_quick_actions')}</Heading>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/projects" className="rounded-md bg-accent px-4 py-3 font-medium text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{t('cms_add_project')}</Link>
          <Link to="/admin/reviews" className="rounded-md border border-border-strong px-4 py-3 font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{t('cms_add_review')}</Link>
          <Link to="/admin/contact" className="rounded-md border border-border-strong px-4 py-3 font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{t('cms_add_contact')}</Link>
          <Link to="/admin/settings" className="rounded-md border border-border-strong px-4 py-3 font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{t('route_settings')}</Link>
        </div>
      </section>
    </div>
  )
}

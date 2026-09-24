import fs from 'node:fs'

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

const app = read('src/App.tsx')
const layout = read('src/routes/AdminLayout.tsx')
const dashboard = read('src/features/cms/Dashboard.tsx')
const settings = read('src/features/cms/SettingsAdmin.tsx')
const settingsData = read('src/features/cms/settings.ts')
const profile = read('src/features/cms/ProfileAdmin.tsx')
const services = read('src/features/cms/ServicesAdmin.tsx')
const skills = read('src/features/cms/SkillsAdmin.tsx')
const en = read('src/i18n/locales/en.ts')
const ar = read('src/i18n/locales/ar.ts')
const rules = read('firestore.rules')
const report = read('docs/phase-12-report.md')

const checks = [
  ['Dashboard route is real, not a placeholder', app.includes("element: <Dashboard />") && !app.includes("index: true, handle: { title: 'Dashboard' } as RootHandle, element: placeholder('route_dashboard')")],
  ['Settings route is real, not a placeholder', app.includes("element: <SettingsAdmin />") && !app.includes("path: 'settings', handle: { title: 'Settings' } as RootHandle, element: placeholder('route_settings')")],
  ['Admin navigation covers operational CMS areas', ['/admin','/admin/projects','/admin/services','/admin/skills','/admin/reviews','/admin/profile','/admin/contact','/admin/settings'].every(path => layout.includes(`to: '${path}'`))],
  ['Admin navigation has desktop and mobile presentation', layout.includes('md:block') && layout.includes('md:hidden') && layout.includes('aria-controls="admin-mobile-navigation"')],
  ['Admin navigation is route-aware and keyboard focusable', layout.includes('NavLink') && layout.includes('focus-visible:outline')],
  ['Dashboard summarizes all core CMS collections', ['listServices(false)','listSkills(false)','listProjects(false)','listReviews(true)','listContactLinks(true)'].every(value => dashboard.includes(value))],
  ['Dashboard reports invalid stored data', dashboard.includes('invalidCount') && dashboard.includes('admin_status_invalid_count')],
  ['Dashboard reports settings readiness', dashboard.includes('getSiteSettings()') && dashboard.includes('settingsReady')],
  ['Settings uses canonical runtime schema', settingsData.includes('siteSettingsInputSchema') && settingsData.includes('siteSettingsSchema')],
  ['Settings writes are optimistic-concurrency protected', settingsData.includes('CmsConflictError') && settingsData.includes('isEqual(expectedUpdatedAt)')],
  ['Settings is admin-only through existing rules', rules.includes('match /settings/main') && rules.includes('allow update: if isAdmin() && valid()')],
  ['Featured project remains managed by Projects contract', settings.includes('getFeaturedProjectId()') && settings.includes('/admin/projects')],
  ['Destructive CMS actions use confirmation', services.includes('window.confirm') && skills.includes('window.confirm')],
  ['Existing admin headings render translated text', profile.includes("{t('route_profile')}") && services.includes("{t('route_services')}") && skills.includes("{t('route_skills')}")],
  ['EN/AR Phase 12 translations exist', en.includes('admin_dashboard_subtitle') && ar.includes('admin_dashboard_subtitle')],
  ['Phase 12 stays isolated from analytics', !layout.includes('analytics') && !dashboard.includes('analytics') && app.includes("path: 'analytics'")],
  ['Phase 12 report states no automatic advancement', report.includes('I did not advance to the next phase.')],
]
const failed = checks.filter(([, ok]) => !ok)
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`)
if (failed.length) process.exit(1)

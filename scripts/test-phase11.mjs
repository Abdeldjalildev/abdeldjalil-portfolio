import fs from 'node:fs'

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

const home = read('src/features/public/Home.tsx')
const root = read('src/routes/Root.tsx')
const app = read('src/App.tsx')
const en = read('src/i18n/locales/en.ts')
const ar = read('src/i18n/locales/ar.ts')
const report = read('docs/phase-11-report.md')

const checks = [
  ['Root renders Home', root.includes("import Home from '../features/public/Home.tsx'") && root.includes('return <Home />')],
  ['Home has no unused project presentation import', !home.includes("projectPresentation.ts")],
  ['Home loads all Phase 11 public dependencies', [
    'getPublicProfile()','listServices(true)','listProjects(true)','getFeaturedProjectId()','listReviews(false)','listContactLinks(false)',
  ].every(value => home.includes(value))],
  ['Featured resolves only against loaded published projects', home.includes('data?.projects.find(project => project.id === data.featuredProjectId)')],
  ['Required conversion sections exist', [
    'about-preview','services-preview','featured-project','additional-projects','social-proof','contact-cta',
  ].every(value => home.includes(value))],
  ['Show More is presentation-only state', home.includes('setShowMore') && home.includes('additionalProjects.slice(0, 3)')],
  ['Public CTA targets exist', home.includes('to="/projects"') && home.includes('to="/contact"')],
  ['Published-only reviews and contacts', home.includes('listReviews(false)') && home.includes('listContactLinks(false)')],
  ['External contact links are hardened', home.includes('noopener noreferrer')],
  ['WhatsApp targets strip non-digit formatting', home.includes("link.value.replace(/\\D/g, '')")],
  ['EN/AR Home copy exists', en.includes('home_featured_title') && ar.includes('home_featured_title')],
  ['Root remains public', app.includes("path: '/'") && app.includes('<Root />')],
  ['No Phase 12 code in Home', !home.includes('/admin/') && !home.includes('Dashboard')],
  ['Phase 11 report remains blocked pending local evidence', report.includes('Gate 4 — Verification') && report.includes('BLOCKED / pending local execution') && report.includes('I did not advance to the next phase.')],
]
const failed = checks.filter(([, ok]) => !ok)
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`)
if (failed.length) process.exit(1)

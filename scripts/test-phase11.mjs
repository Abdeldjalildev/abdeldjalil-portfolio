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
  ['Home loads profile/services/projects/featured/reviews/contact', [
    'getPublicProfile()',
    'listServices(true)',
    'listProjects(true)',
    'getFeaturedProjectId()',
    'listReviews(false)',
    'listContactLinks(false)',
  ].every(value => home.includes(value))],
  ['Featured project is resolved from published projects', home.includes('data.projects.find(project => project.id === data.featuredProjectId)')],
  ['Home includes conversion sections', ['about-preview', 'services-preview', 'featured-project', 'additional-projects', 'social-proof', 'contact-cta'].every(value => home.includes(value))],
  ['Show More behavior exists', home.includes('home_show_more') && home.includes('setShowMore')],
  ['Project and contact CTAs use routes', home.includes('to="/projects"') && home.includes('to="/contact"')],
  ['Published reviews only', home.includes('listReviews(false)')],
  ['Published contact links only', home.includes('listContactLinks(false)')],
  ['External links are hardened', home.includes('noopener noreferrer')],
  ['EN/AR home translations exist', en.includes('home_featured_title') && ar.includes('home_featured_title')],
  ['Home route remains public root', app.includes("path: '/',") && app.includes('<Root />')],
  ['Phase 11 stays isolated', report.includes('I did not advance to the next phase.') && !report.includes('Phase 12 implementation')],
]

const failed = checks.filter(([, ok]) => !ok)
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`)
if (failed.length) process.exit(1)

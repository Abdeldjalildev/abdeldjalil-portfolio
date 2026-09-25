import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []
const assert = (condition, message) => {
  if (!condition) failures.push(message)
}

const app = read('src/App.tsx')
const projects = read('src/features/public/Projects.tsx')
const detail = read('src/features/public/ProjectDetail.tsx')
const details = read('src/features/public/ProjectDetails.tsx')
const card = read('src/features/public/ProjectCard.tsx')
const media = read('src/features/public/ProjectMedia.tsx')
const presentation = read('src/features/public/projectPresentation.ts')
const data = read('src/features/cms/projects.ts')
const rules = read('firestore.rules')
const en = read('src/i18n/locales/en.ts')
const ar = read('src/i18n/locales/ar.ts')
const docs = read('docs/phase-09-report.md')
const pkg = JSON.parse(read('package.json'))

assert(app.includes("path: 'projects'") && app.includes('<Projects />'), 'public /projects route is missing')
assert(app.includes("path: 'projects/:slug'") && app.includes('<ProjectDetail />'), 'public project detail route is missing')
assert(projects.includes("listProjects(true)"), 'Projects page is not restricted to published CMS data')
assert(projects.includes('useSearchParams') && projects.includes('items[0]'), 'Projects page has no deterministic selection/default behavior')
assert(projects.includes('setSearchParams'), 'Projects selection is not reflected in the URL')
assert(card.includes('ProjectMedia') && card.includes('ProjectDetails') === false, 'Project cards are not using the shared media presentation')
assert(details.includes('caseStudy') && details.includes('galleryPaths') && details.includes('liveUrl') && details.includes('repoUrl'), 'Project detail presentation is incomplete')
assert(details.includes('noopener noreferrer'), 'External project links are not hardened')
assert(detail.includes('getPublishedProject') && detail.includes('projects_not_found_title'), 'Project detail does not distinguish missing/unpublished content safely')
assert(detail.includes('<Seo') && detail.includes('getProjectSeoTitle') && detail.includes('getProjectSeoDescription'), 'Project detail is not wired to the canonical SEO component')
const seo = read('src/components/seo/Seo.tsx')
assert(seo.includes('document.title') && seo.includes("meta[${attribute}=\"${key}\"]"), 'Shared SEO component does not own document metadata updates')
assert(seo.includes('new URL(path, window.location.origin)'), 'Shared SEO component does not build canonical URLs from the runtime origin')
assert(media.includes('loading={priority ?') && media.includes('getPublicMediaUrl'), 'Project media does not use lazy loading and Storage download URLs')
assert(presentation.includes('getDownloadURL') && presentation.includes('localizeProjectText'), 'Project presentation helpers are incomplete')
assert(data.includes('export async function getPublishedProject'), 'Published-only single-project data access helper is missing')
assert(rules.includes('allow read: if resource.data.published == true || isAdmin()'), 'Project public read rule is missing')
assert(en.includes('projects_title') && en.includes('projects_case_study') && en.includes('projects_gallery'), 'English Phase 09 translations are incomplete')
assert(ar.includes('projects_title') && ar.includes('projects_case_study') && ar.includes('projects_gallery'), 'Arabic Phase 09 translations are incomplete')
assert(pkg.scripts['test:phase09'] === 'node scripts/test-phase09.mjs', 'Phase 09 verification command is not registered')
assert(docs.includes('Phase 09') && docs.includes('I did not advance to the next phase.'), 'Phase 09 report is missing closure discipline')

if (failures.length) {
  console.error('Phase 09 static checks FAILED:')
  failures.forEach(f => console.error('- ' + f))
  process.exit(1)
}

console.log('Phase 09 static checks PASS: public project listing, selection, deep links, case-study fields, media, external links, SEO wiring, and published-only access are present.')

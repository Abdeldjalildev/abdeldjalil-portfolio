import fs from 'node:fs'
import assert from 'node:assert/strict'

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const app = read('src/App.tsx')
const seo = read('src/components/seo/Seo.tsx')
const publicLayout = read('src/routes/PublicLayout.tsx')
const projectDetail = read('src/features/public/ProjectDetail.tsx')
const media = read('src/features/public/ProjectMedia.tsx')
const adminLayout = read('src/routes/AdminLayout.tsx')
const footer = read('src/components/shell/PublicFooter.tsx')
const storage = read('storage.rules')
const storageTests = read('scripts/test-rules.mjs')
const indexHtml = read('index.html')
const robots = read('public/robots.txt')
const firebase = read('firebase.json')
const functionsIndex = read('functions/index.js')
const sitemapExists = fs.existsSync(new URL('../public/sitemap.xml', import.meta.url))
const en = read('src/i18n/locales/en.ts')
const ar = read('src/i18n/locales/ar.ts')
const report = read('docs/phase-14-report.md')
const gitignore = read('.gitignore')

const checks = [
  ['Public feature routes are lazy-loaded', app.includes("const Home = lazy(") && app.includes("const ProjectDetail = lazy(")],
  ['Admin feature routes are lazy-loaded', app.includes("const Dashboard = lazy(") && app.includes("const AnalyticsAdmin = lazy(")],
  ['Dev design-system route is lazy-loaded', app.includes("const DesignSystemPreview = lazy(")],
  ['SEO uses the current deployment origin', !seo.includes('SITE_ORIGIN') && seo.includes('window.location.origin')],
  ['Public SEO boundary exists', fs.existsSync(new URL('../src/components/seo/Seo.tsx', import.meta.url)) && seo.includes('canonical')],
  ['Public shell applies SEO metadata', publicLayout.includes('<Seo')],
  ['Project detail uses centralized SEO', projectDetail.includes('<Seo') && !projectDetail.includes('document.querySelector(\'meta[name="description"]\')')],
  ['Crawler robots policy exists', robots.includes('Disallow: /admin') && robots.includes('Disallow: /sign-in')],
  ['Sitemap is generated from published projects', !sitemapExists && functionsIndex.includes('exports.sitemap') && functionsIndex.includes("where('published', '==', true)") && functionsIndex.includes('MAX_SITEMAP_PROJECT_URLS')],
  ['Hosting routes sitemap to the sitemap function', firebase.includes('"source": "/sitemap.xml"') && firebase.includes('"functionId": "sitemap"') && firebase.includes('"region": "us-central1"')],
  ['Index metadata includes crawler/social defaults', indexHtml.includes('og:title') && indexHtml.includes('robots') && indexHtml.includes('theme-color')],
  ['Public media prioritizes critical images', media.includes('fetchPriority={priority ? \'high\' : \'auto\'}')],
  ['Admin mobile navigation has dialog semantics', adminLayout.includes('role="dialog"') && adminLayout.includes('aria-modal="true"')],
  ['Admin mobile navigation traps focus and Escape', adminLayout.includes("event.key === 'Escape'") && adminLayout.includes("event.key !== 'Tab'")],
  ['Admin mobile navigation locks body scroll', adminLayout.includes("document.body.style.overflow = 'hidden'")],
  ['Skip links exist for public and admin', publicLayout.includes('skip_to_content') && adminLayout.includes('skip_to_content')],
  ['Footer icons use valid SVG containers', footer.includes('<svg {...common}>') && footer.includes("'aria-hidden': true")],
  ['Interactive targets are strengthened', read('src/components/shell/LocaleSwitcher.tsx').includes('min-h-11') && read('src/components/shell/PublicHeader.tsx').includes('h-11 w-11') && footer.includes('size-11')],
  ['Staged uploads are server-validated', storage.includes("scope.matches('^project-") && storage.includes('isRasterImage()') && storage.includes('request.resource.size <= 5242880')],
  ['Staged media tests cover invalid types', storageTests.includes('SVG into a project staging path') && storageTests.includes('PDF into an image-only project staging path')],
  ['Analytics security boundary remains intact', read('firestore.rules').includes('match /analyticsVisitors/{visitorKey}') && read('firestore.rules').includes('allow read, write: if false')],
  ['No service-account JSON is tracked', !gitignore.includes('service-account') || gitignore.includes('**/service-account*.json')],
  ['EN/AR skip-link translations exist', en.includes("skip_to_content: 'Skip to content'") && ar.includes("skip_to_content: 'تجاوز إلى المحتوى'")],
  ['Phase 14 report has six gates and no advancement', report.includes('Gate 1') && report.includes('Gate 6') && report.includes('I did not advance to the next phase.')],
]

for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`)
  assert.equal(ok, true, label)
}

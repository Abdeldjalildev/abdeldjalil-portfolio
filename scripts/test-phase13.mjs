import fs from 'node:fs'

function read(path) {
  return fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

const app = read('src/App.tsx')
const layout = read('src/routes/AdminLayout.tsx')
const publicLayout = read('src/routes/PublicLayout.tsx')
const analytics = read('src/data/analytics.ts')
const projectDetail = read('src/features/public/ProjectDetail.tsx')
const admin = read('src/features/cms/AnalyticsAdmin.tsx')
const functions = read('functions/index.js')
const functionPackage = read('functions/package.json')
const firebase = read('firebase.json')
const rules = read('firestore.rules')
const indexes = read('firestore.indexes.json')
const env = read('.env.example')
const report = read('docs/phase-13-report.md')
const dataModel = read('docs/data-model.md')
const en = read('src/i18n/locales/en.ts')
const ar = read('src/i18n/locales/ar.ts')

const checks = [
  ['Functions runtime package declares Node 20', functionPackage.includes('"node": "20"') && functionPackage.includes('firebase-functions')],
  ['Analytics callable is registered', firebase.includes('"functions"') && firebase.includes('"source": "functions"')],
  ['Analytics function has fixed event allowlist', functions.includes('const EVENTS = new Set') && functions.includes('resume_download')],
  ['Analytics payload rejects arbitrary objects', functions.includes('if (!isPlainObject(data))') && functions.includes("Unsupported analytics event.")],
  ['Analytics rate limit is bounded', functions.includes('MAX_EVENTS_PER_VISITOR_PER_DAY = 100') && functions.includes('Daily analytics limit reached')],
  ['Analytics stores a hashed visitor identifier', functions.includes("createHash('sha256')") && functions.includes('visitorHash')],
  ['Analytics has bounded path cardinality', functions.includes('MAX_PATH_ENTRIES_PER_DAY = 50')],
  ['Analytics function scaling is bounded', functions.includes('maxInstances: 3') && functions.includes('enforceAppCheck: true')],
  ['Analytics retention is implemented server-side', functions.includes('RETENTION_DAYS = 90') && functions.includes('exports.pruneAnalytics') && functions.includes('RETENTION_DELETE_BATCH_SIZE = 450') && functions.includes('RETENTION_MAX_BATCHES_PER_RUN = 5')],
  ['Analytics daily aggregates are admin-readable only', rules.includes('match /analyticsDaily/{date}') && rules.includes('allow read: if isAdmin();') && rules.includes('allow write: if false;')],
  ['Public analytics writes are impossible through Firestore rules', rules.includes('match /analyticsDaily/{date}') && rules.includes('allow write: if false;')],
  ['Analytics visitor markers are not client-readable', rules.includes('match /analyticsVisitors/{visitorKey}') && rules.includes('allow read, write: if false;')],
  ['Analytics map fields avoid unnecessary indexes', indexes.includes('"analyticsDaily"') && indexes.includes('"eventCounts"') && indexes.includes('"pathCounts"')],
  ['Optional App Check is wired before Firebase product use', env.includes('VITE_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY') && fs.existsSync(new URL('../src/firebase/appCheck.ts', import.meta.url))],
  ['Public page views are tracked', publicLayout.includes("trackEvent('page_view'")],
  ['Project and conversion events are tracked', analytics.includes('project_view') && read('src/features/public/ProjectDetails.tsx').includes('project_live_demo_click') && read('src/features/public/Contact.tsx').includes('contact_click')],
  ['Project views are not tied to locale changes', projectDetail.includes("}, [project])") && !projectDetail.includes("}, [project, locale])")],
  ['Analytics failures cannot block UI', analytics.includes('.catch(() => {})')],
  ['Admin analytics route is real', app.includes("element: <AnalyticsAdmin />") && !app.includes("path: 'analytics', handle: { title: 'Analytics' } as RootHandle, element: placeholder")],
  ['Analytics navigation is present', layout.includes("{ to: '/admin/analytics', key: 'route_analytics' }")],
  ['Admin analytics reads only bounded recent daily documents', admin.includes('Array.from({ length: 14') && admin.includes("analyticsDaily")],
  ['Analytics contract is documented', dataModel.includes('Phase 13 — Analytics contract') && report.includes('Gate 1')],
  ['EN/AR analytics translations exist', en.includes('admin_analytics_subtitle') && ar.includes('admin_analytics_subtitle')],
  ['Phase 13 report does not claim local execution', report.includes('pending local execution') && report.includes('I did not advance to the next phase.')],
]

const failed = checks.filter(([, ok]) => !ok)
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} — ${label}`)
if (failed.length) process.exit(1)

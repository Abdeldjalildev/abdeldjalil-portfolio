import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const exists = file => fs.existsSync(path.join(root, file))
const failures = []
const assert = (condition, message) => {
  if (!condition) failures.push(message)
}

const firebase = JSON.parse(read('firebase.json'))
const pkg = JSON.parse(read('package.json'))
const agents = read('AGENTS.md')
const readme = read('README.md')
const env = read('.env.example')
const app = read('src/App.tsx')
const main = read('src/main.tsx')
const appCheck = read('src/firebase/appCheck.ts')
const functions = read('functions/index.js')
const functionPackage = JSON.parse(read('functions/package.json'))
const sitemap = read('public/sitemap.xml')
const robots = read('public/robots.txt')
const firestore = read('firestore.rules')
const storage = read('storage.rules')

assert(firebase.hosting?.public === 'dist', 'Firebase Hosting must publish the Vite dist directory')
assert(
  Array.isArray(firebase.hosting?.rewrites) &&
    firebase.hosting.rewrites.some(rule => rule.source === '**' && rule.destination === '/index.html'),
  'Firebase Hosting must have an SPA fallback rewrite to /index.html',
)
assert(firebase.firestore?.rules === 'firestore.rules', 'Firestore rules path is not the canonical checked-in rules file')
assert(firebase.firestore?.indexes === 'firestore.indexes.json', 'Firestore indexes path is not the canonical checked-in indexes file')
assert(firebase.storage?.rules === 'storage.rules', 'Storage rules path is not the canonical checked-in rules file')
assert(firebase.functions?.source === 'functions', 'Cloud Functions source directory is not configured')
assert(pkg.scripts?.['functions:check'] === 'node --check functions/index.js', 'Functions syntax verification command is missing')
assert(pkg.scripts?.['test:phase15'] === 'node scripts/test-phase15.mjs', 'Phase 15 static verification command is missing')

for (const command of [
  'lint','build','functions:check','test:schema','test:rules',
  'test:phase07','test:phase08','test:phase09','test:phase10',
  'test:phase11','test:phase12','test:phase13','test:phase14','test:phase15',
]) {
  assert(typeof pkg.scripts?.[command] === 'string', 'Release verification command is missing: npm run ' + command)
}

assert(
  readme.includes('Phase 15 — Final production verification & release readiness') &&
  readme.includes('pending local/runtime evidence'),
  'README must describe Phase 15 as pending runtime evidence rather than falsely claiming release readiness',
)
assert(readme.includes('firebase deploy --only hosting,functions,firestore:rules,firestore:indexes,storage'), 'README deployment scope is missing')
assert(readme.includes('Production App Check enforcement must be verified'), 'README must state the production App Check acceptance requirement')

assert(env.includes('VITE_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY'), 'Production App Check environment contract is missing')
assert(appCheck.includes('ReCaptchaEnterpriseProvider') && appCheck.includes('isTokenAutoRefreshEnabled: true'), 'Web App Check provider contract is incomplete')
assert(functions.includes('enforceAppCheck: true'), 'Analytics callable is not App Check enforced')
assert(functions.includes('maxInstances: 3'), 'Analytics callable scaling ceiling is missing')
assert(functions.includes('exports.pruneAnalytics'), 'Analytics retention cleanup is missing')
assert(functionPackage.engines?.node === '20', 'Functions runtime contract is not Node 20')

assert(app.includes("path: 'projects/:slug'") && app.includes("path: '/admin'"), 'Critical public/admin route boundaries are missing')
assert(app.includes('<AdminAccessBoundary />'), 'Admin route is missing the authorization boundary')
assert(main.includes('initializeConfiguredAppCheck()') && main.includes('getFirebaseApp()'), 'Firebase/App Check bootstrap ordering contract is missing')

assert(robots.includes('Disallow: /admin') && robots.includes('Disallow: /sign-in') && robots.includes('Sitemap: /sitemap.xml'), 'robots.txt release policy is incomplete')
assert(sitemap.includes('https://abdeldjalil-portfolio.web.app/'), 'sitemap must contain the configured production Firebase Hosting origin')
assert(!sitemap.includes('localhost') && !sitemap.includes('127.0.0.1'), 'sitemap contains a development origin')

assert(firestore.includes('function isAdmin()') && firestore.includes('request.auth.token.admin == true'), 'Firestore admin authorization boundary is missing')
assert(firestore.includes('match /analyticsVisitors/{visitorKey}') && firestore.includes('allow read, write: if false'), 'Analytics visitor markers must remain inaccessible to clients')
assert(storage.includes('function isAdmin()') && storage.includes('allow write: if isAdmin()'), 'Storage admin write boundary is missing')
assert(storage.includes('image/svg+xml') === false, 'SVG must remain excluded from the hardened Storage image contract')

const secretPatterns = [
  /AIza[0-9A-Za-z_-]{20,}/,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  /serviceAccountKey/i,
]
for (const pattern of secretPatterns) {
  assert(!pattern.test(env), 'Potential secret pattern found in .env.example: ' + pattern)
  assert(!pattern.test(functions), 'Potential secret pattern found in functions/index.js: ' + pattern)
}

for (const phase of Array.from({ length: 14 }, (_, index) => String(index + 1).padStart(2, '0'))) {
  assert(exists('docs/phase-' + phase + '-report.md'), 'Missing phase report: phase-' + phase)
}
assert(exists('docs/phase-15-report.md'), 'Missing Phase 15 report')
assert(exists('scripts/test-phase15.mjs'), 'Missing Phase 15 verification harness')

assert(
  agents.includes('Phase 01 through Phase 15: NOT STARTED.') &&
  agents.includes('Only the owner may change a phase to CLOSED.'),
  'AGENTS phase ledger/owner-closure contract was changed unexpectedly',
)
assert(agents.includes('Deployment remains a separate explicit action.'), 'Phase 15 deployment boundary is missing from AGENTS')

if (failures.length) {
  console.error('Phase 15 static release checks FAILED:')
  for (const failure of failures) console.error('- ' + failure)
  process.exit(1)
}

console.log('Phase 15 static release checks PASS:')
console.log('- Firebase Hosting SPA release configuration')
console.log('- Firebase resource wiring and deployment boundary')
console.log('- complete verification command inventory')
console.log('- production App Check and analytics security contract')
console.log('- public/admin route and authorization boundaries')
console.log('- robots/sitemap production metadata')
console.log('- secret-pattern and phase-report checks')
console.log('- AGENTS owner-closure and no-auto-deploy contract')

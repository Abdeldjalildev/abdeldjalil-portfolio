import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []

function assert(condition, message) {
  if (!condition) failures.push(message)
}

const en = read('src/i18n/locales/en.ts')
const ar = read('src/i18n/locales/ar.ts')
const keys = (source) => [...source.matchAll(/^  ([A-Za-z0-9_]+):/gm)].map((match) => match[1])
const enKeys = keys(en)
const arKeys = keys(ar)

assert(enKeys.length === arKeys.length, `translation key counts differ: en=${enKeys.length}, ar=${arKeys.length}`)
assert(enKeys.every((key) => arKeys.includes(key)), 'Arabic dictionary is missing an English key')
assert(arKeys.every((key) => enKeys.includes(key)), 'English dictionary is missing an Arabic key')

const app = read('src/App.tsx')
assert(app.includes("element: <About />"), 'public /about is not connected to the Phase 07 page')
assert(app.includes("element: <Services />"), 'public /services is not connected to the Phase 07 page')
assert(app.includes("element: <ProfileAdmin />"), 'admin /profile is not connected to the Phase 07 page')
assert(app.includes("element: <ServicesAdmin />"), 'admin /services is not connected to the Phase 07 page')
assert(app.includes("element: <SkillsAdmin />"), 'admin /skills is not connected to the Phase 07 page')

const data = read('src/features/cms/data.ts')
assert(data.includes("profileInputSchema") && data.includes("serviceInputSchema") && data.includes("skillInputSchema"), 'CMS writes do not use the canonical Phase 05 input schemas')
assert(data.includes('runTransaction'), 'CMS updates do not use Firestore transactions')
assert(data.includes('isEqual(expectedUpdatedAt)'), 'CMS updates do not enforce compare-before-overwrite concurrency')
assert(data.includes("where('published', '==', true)"), 'public collection reads are missing the published filter')

for (const file of [
  'src/features/cms/ProfileAdmin.tsx',
  'src/features/cms/ServicesAdmin.tsx',
  'src/features/cms/SkillsAdmin.tsx',
  'src/features/public/About.tsx',
  'src/features/public/Services.tsx',
]) {
  const source = read(file)
  assert(!source.includes('localStorage'), `${file} uses localStorage for CMS state`)
}

const rules = read('firestore.rules')
assert(rules.includes('match /profile/main'), 'profile/main rule is missing')
assert(rules.includes('match /services/{serviceId}'), 'services rule is missing')
assert(rules.includes('match /skills/{skillId}'), 'skills rule is missing')
assert(rules.includes('allow create: if isAdmin()'), 'admin-only create rule is missing')
const servicesStart = rules.indexOf('match /services/{serviceId} {')
const skillsStart = rules.indexOf('match /skills/{skillId} {')
const servicesRule = servicesStart >= 0 && skillsStart > servicesStart ? rules.slice(servicesStart, skillsStart) : ''
assert(Boolean(servicesRule), 'services rule block is missing or malformed')
assert(servicesRule.includes("keysAre(['title', 'slug', 'summary', 'description', 'iconPath', 'order',"), 'services rule does not use the Phase 07 service field contract')
assert(!servicesRule.includes('isContactTarget('), 'services rule incorrectly applies contact-link target validation to service documents')

if (failures.length) {
  console.error('Phase 07 static checks FAILED:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Phase 07 static checks PASS: ${enKeys.length} translation keys, route wiring, canonical schema usage, transactional writes, publication filtering, and security-rule anchors verified.`)

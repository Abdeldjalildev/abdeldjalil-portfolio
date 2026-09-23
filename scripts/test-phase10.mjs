import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const read = file => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []
const assert = (condition, message) => { if (!condition) failures.push(message) }

const app = read('src/App.tsx')
const rules = read('firestore.rules')
const reviews = read('src/features/cms/reviews.ts')
const contacts = read('src/features/cms/contactLinks.ts')
const publicReviews = read('src/features/public/Reviews.tsx')
const publicContact = read('src/features/public/Contact.tsx')
const adminReviews = read('src/features/cms/ReviewsAdmin.tsx')
const adminContacts = read('src/features/cms/ContactLinksAdmin.tsx')
const en = read('src/i18n/locales/en.ts')
const ar = read('src/i18n/locales/ar.ts')
const pkg = JSON.parse(read('package.json'))
const report = read('docs/phase-10-report.md')

assert(app.includes("path: 'reviews'") && app.includes('<Reviews />'), 'public reviews route missing')
assert(app.includes("path: 'contact'") && app.includes('<Contact />'), 'public contact route missing')
assert(app.includes('<ReviewsAdmin />') && app.includes('<ContactLinksAdmin />'), 'admin review/contact routes missing')
assert(reviews.includes("where('status', '==', 'published')") && reviews.includes("orderBy('order')"), 'published review query missing')
assert(contacts.includes("where('published', '==', true)") && contacts.includes("orderBy('order')"), 'published contact query missing')
assert(publicReviews.includes('average') && publicReviews.includes('rating') && publicReviews.includes('listReviews(false)'), 'public review aggregate/query missing')
assert(publicContact.includes('noopener noreferrer') && publicContact.includes('listContactLinks(false)'), 'public contact link handling missing')
assert(adminReviews.includes('changeReviewStatus') && adminReviews.includes('deleteReview'), 'review moderation controls missing')
assert(adminContacts.includes('validateContactTarget') && adminContacts.includes('deleteContactLink'), 'contact validation/admin controls missing')
assert(rules.includes('validTransition()') && rules.includes("status == 'pending'") && rules.includes("status == 'approved'") && rules.includes("status == 'published'"), 'review transition rules missing')
assert(rules.includes('isContactTarget') && rules.includes("request.resource.data.type"), 'contact target rule validation missing')
assert(en.includes('reviews_average') && en.includes('contact_title') && ar.includes('reviews_average') && ar.includes('contact_title'), 'Phase 10 translations missing')
assert(pkg.scripts['test:phase10'] === 'node scripts/test-phase10.mjs', 'Phase 10 static test not registered')
assert(report.includes('I did not advance to the next phase.'), 'Phase 10 report isolation statement missing')

if (failures.length) {
  console.error('Phase 10 static checks FAILED:')
  failures.forEach(failure => console.error('- ' + failure))
  process.exit(1)
}
console.log('Phase 10 static checks PASS')

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const failures = []
const assert = (condition, message) => { if (!condition) failures.push(message) }

const schema = read('src/data/schema/schemas.ts')
const types = read('src/data/types.ts')
const paths = read('src/data/paths.ts')
const rules = read('firestore.rules')
const storage = read('storage.rules')
const data = read('src/features/cms/projects.ts')
const admin = read('src/features/cms/ProjectsAdmin.tsx')
const app = read('src/App.tsx')
const docs = read('docs/data-model.md')
const pkg = JSON.parse(read('package.json'))

for (const field of ['title','slug','summary','description','caseStudy','technologies','category','thumbnailPath','galleryPaths','liveUrl','repoUrl','links','seo','published','order']) {
  assert(schema.includes(field), 'project schema is missing ' + field)
  assert(types.includes(field), 'project type is missing ' + field)
}
assert(paths.includes('projectThumbnailObjectPath') && paths.includes('projectGalleryObjectPath'), 'project storage path helpers are missing')
assert(data.includes('projectInputSchema') && data.includes('runTransaction'), 'project writes do not use canonical schema + transactions')
assert(data.includes('uploadProjectMedia') && data.includes('moveStorageObject'), 'project media pipeline is incomplete')
assert(admin.includes("next.length + selectedFiles.length > 12"), 'gallery capacity must be validated before staging uploads')
assert(admin.includes('for (const path of stagedPaths)'), 'failed project uploads must clean newly staged media')
assert(data.includes('isEqual(project.updatedAt)'), 'project deletion must enforce optimistic concurrency')
assert(data.includes('transaction.delete(refDoc)'), 'project deletion must remove Firestore data transactionally before media cleanup')
assert(data.includes('wasFeatured') && data.includes('setFeaturedProject(null)'), 'unpublishing a featured project must clear the featured reference before the rule blocks publication-state change')
assert(data.includes('STORAGE_LIMITS.projectThumbnail') && data.includes('STORAGE_LIMITS.projectGallery'), 'client media size checks are missing')
assert(admin.includes('ProjectsAdmin') && admin.includes('uploadProjectMedia'), 'project admin UI is not wired to media pipeline')
assert(admin.includes('cms_project_links') && admin.includes('cms_seo_title_en'), 'project admin does not expose links/SEO contract fields')
assert(app.includes("element: <ProjectsAdmin />"), 'admin projects route is not connected')
assert(rules.includes("request.resource.data.featuredProjectId)).data.published == true"), 'featured project publication invariant is not enforced')
assert(rules.includes('request.resource.data.published == true') && rules.includes('featuredProjectId != request.resource.data.slug'), 'featured project cannot be silently unpublished')
assert(storage.includes('match /projects/{projectId}/thumbnail/{fileName}') && storage.includes('match /projects/{projectId}/gallery/{fileName}'), 'project storage rules are missing')
assert(storage.includes('match /drafts/{scope}/{fileName}') && storage.includes('allow get: if true'), 'project draft/public media contract is incomplete')
assert(docs.includes('Project media lifecycle') && docs.includes('Featured project invariant'), 'Phase 08 data-model evidence is missing')
assert(pkg.scripts['test:phase08'] === 'node scripts/test-phase08.mjs', 'Phase 08 verification command is not registered')

if (failures.length) {
  console.error('Phase 08 static checks FAILED:')
  failures.forEach(f => console.error('- ' + f))
  process.exit(1)
}
console.log('Phase 08 static checks PASS: project contract, CMS route, media pipeline, storage paths, featured invariant, and verification wiring are present.')

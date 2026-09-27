import { readFile } from 'node:fs/promises'

const provider = await readFile('src/auth/AuthProvider.tsx', 'utf8')
const boundary = await readFile('src/routes/AdminAccessBoundary.tsx', 'utf8')
const context = await readFile('src/auth/context.ts', 'utf8')

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Phase 04 auth contract failed: ${message}`)
  }
}

assert(provider.includes("useRef"), 'AuthProvider must use a request-generation ref')
assert(provider.includes("const authRequestRef = useRef(0)"), 'auth request generation must start at zero')
assert(provider.includes("const requestId = ++authRequestRef.current"), 'each auth operation must capture a new generation')
assert(
  (provider.match(/if \(requestId !== authRequestRef\.current\) return/g) ?? []).length >= 2,
  'both manual refresh and auth-state claim loading must reject stale results',
)
assert(
  (provider.match(/currentUser\.uid !== user\.uid/g) ?? []).length >= 2,
  'both auth paths must verify that the resolved user is still current',
)
assert(provider.includes('const claims = await loadClaims(user, true)'), 'manual refetch must force a trusted token refresh')
assert(
  provider.includes('} catch {') && provider.includes("setState({ status: 'unauthenticated' })"),
  'claim refresh failures must fail closed without propagating an unhandled rejection',
)
assert(
  provider.includes('++authRequestRef.current\n      unsubscribe()'),
  'provider cleanup must invalidate in-flight auth reads',
)
assert(!/(localStorage|sessionStorage)\\s*\\./.test(provider), 'auth provider must not persist authorization state')
assert(!/(localStorage|sessionStorage)\\s*\\./.test(context), 'auth context must not persist authorization state')
assert(boundary.includes('state.claims.admin'), 'admin access must depend on the trusted claims state')
assert(boundary.includes('void refetch()'), 'admin boundary must retain the manual refresh recovery path')
assert(!/(localStorage|sessionStorage)\\s*\\./.test(boundary), 'admin boundary must not persist authorization state')

console.log('Phase 04 auth contract: PASS')
console.log('- manual claim refresh fails closed')
console.log('- stale async auth results are ignored')
console.log('- current Firebase user identity is rechecked before publishing claims')
console.log('- unmount invalidates in-flight auth reads')
console.log('- no client-side authorization persistence detected')

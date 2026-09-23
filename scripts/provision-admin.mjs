#!/usr/bin/env node
/**
 * Phase 04 — privileged admin-claim provisioning.
 *
 * LOCAL OPERATOR TOOLING ONLY. This file is never bundled into the browser
 * application: Vite bundles only what is reachable from `src/`, and
 * `tsconfig.app.json` includes only `src`. It exists because the `admin` custom
 * claim can only be assigned from a privileged environment — never from the
 * browser — and the Admin SDK is the supported mechanism for doing so.
 *
 * WHY THIS EXISTS
 *   React state, the URL, DevTools or localStorage must never be able to make a
 *   user an administrator. Custom claims are set exclusively through the Admin
 *   SDK and are then delivered to clients inside the ID token, where security
 *   rules and server-side code can verify them as trusted state.
 *
 * CREDENTIALS (never committed — see .gitignore)
 *   Uses Application Default Credentials. Provide one of:
 *     - set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON key, or
 *     - run `gcloud auth application-default login`.
 *   This script never prints credential values.
 *
 * OPERATOR ACTION IS EXPLICIT
 *   Nothing is automatic: a command, a target user and valid credentials are all
 *   required. There is no endpoint, button or rule that lets a user self-promote,
 *   and no promotion happens merely because an email address exists.
 *
 * USAGE
 *   node scripts/provision-admin.mjs status <uid|email>
 *   node scripts/provision-admin.mjs grant  <uid|email>
 *   node scripts/provision-admin.mjs revoke <uid|email>
 *
 * Through npm (note the `--` before arguments):
 *   npm run admin:claim -- grant admin@example.com
 *
 * TOKEN PROPAGATION
 *   A claim change does not mutate an already-issued ID token. After `grant` the
 *   operator signs in again, or presses "Refresh access" in the admin UI (which
 *   calls getIdTokenResult(true)). `revoke` also revokes the user's refresh
 *   tokens so the privileged token can no longer be renewed; note that an
 *   already-issued ID token stays valid until it expires (at most one hour).
 */
import process from 'node:process'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID ?? 'abdeldjalil-portfolio'
const COMMANDS = ['status', 'grant', 'revoke']
const [command, target] = process.argv.slice(2)

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

function usage(reason) {
  if (reason) {
    console.error(`\n✖ ${reason}`)
  }
  console.error(
    [
      '',
      'Usage: node scripts/provision-admin.mjs <command> <uid|email>',
      '',
      '  status   show the current admin claim for the user',
      '  grant    set admin: true',
      '  revoke   remove the admin claim and revoke refresh tokens',
      '',
      `  project: ${PROJECT_ID} (override with FIREBASE_ADMIN_PROJECT_ID)`,
      '',
      '  Credentials come from Application Default Credentials.',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

if (!COMMANDS.includes(command) || !target) {
  usage(command ? `Expected a uid or email after "${command}".` : 'Missing command.')
}

const app = initializeApp(
  { credential: applicationDefault(), projectId: PROJECT_ID },
  'provision-admin',
)
const auth = getAuth(app)

let user
try {
  user = await auth.getUser(target)
} catch (error) {
  if (error?.code === 'auth/user-not-found') {
    fail(`No Firebase Auth user matches "${target}" in project ${PROJECT_ID}.`)
  }
  fail(
    [
      'Could not reach Firebase Auth with Admin credentials.',
      '  Set GOOGLE_APPLICATION_CREDENTIALS to a service-account key, or run',
      '  `gcloud auth application-default login`, then try again.',
      `  reason: ${error?.code || error?.message || 'unknown error'}`,
    ].join('\n'),
  )
}

const current = user.customClaims ?? {}

console.log(`project : ${PROJECT_ID}`)
console.log(`uid     : ${user.uid}`)
console.log(`email   : ${user.email ?? '(none)'}`)
console.log(`admin   : ${current.admin === true} (before)`)

if (command === 'grant') {
  if (current.admin === true) {
    console.log('\n= No change: this user already has admin: true.')
  } else {
    await auth.setCustomUserClaims(user.uid, { ...current, admin: true })
    console.log('\n✔ Granted admin: true.')
    console.log('  An already-issued ID token is not mutated — sign in again, or press')
    console.log('  "Refresh access" on /admin, to receive the claim.')
  }
}

if (command === 'revoke') {
  const next = { ...current }
  delete next.admin
  await auth.setCustomUserClaims(user.uid, next)
  await auth.revokeRefreshTokens(user.uid)
  console.log('\n✔ Removed the admin claim and revoked refresh tokens.')
  console.log('  A previously issued ID token stays valid until it expires (<= 1h);')
  console.log('  it can no longer be renewed.')
}

const after = await auth.getUser(user.uid)
console.log(`admin   : ${after.customClaims?.admin === true} (after)`)

/**
 * Phase 05 — minimal runtime validation core.
 *
 * WHY THIS EXISTS
 *   TypeScript is erased at build time, so it cannot validate a document that
 *   arrives from Firestore, a CMS payload or any other trust boundary. These
 *   parsers are the runtime layer that does.
 *
 * WHY IT IS HAND-WRITTEN RATHER THAN A LIBRARY
 *   AGENTS.md requires that a dependency be justified against what the existing
 *   stack can already do. The requirement here is a small, closed set of document
 *   shapes; the aggregate surface is roughly 120 lines of combinators, which is
 *   less code and less risk than adopting and configuring a general-purpose
 *   schema library (and adds nothing to the client bundle). It also keeps the
 *   parsers free of any dependency on the Firebase runtime, so they can be
 *   executed and verified in plain Node.
 *
 * RELATIONSHIP TO THE OTHER LAYERS
 *   firestore.rules  — authoritative security + critical invariants
 *   these parsers    — full application-level document shape
 *   src/data/types   — developer-facing contract
 *   All three describe the same documents. This layer mirrors the rules' exact
 *   key sets deliberately, so an extra or missing field fails in both places.
 *
 * CONVENTIONS
 *   - Parsers never throw: they push issues and return `undefined`.
 *   - Issues carry the full dotted path so a failure identifies the exact field.
 *   - Nothing is silently coerced. A wrong type is an issue, not a fix-up.
 */
import type { Timestamp } from 'firebase/firestore'
import { MAX_SLUG_LENGTH, isValidSlug } from '../paths.ts'
import type { DocumentTimestamps, LocalizedText } from '../types.ts'

export type Issue = {
  path: string
  message: string
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: Issue[] }

/** Returns the parsed value, or `undefined` after recording issue(s). */
export type Parser<T> = (value: unknown, path: string, issues: Issue[]) => T | undefined

/** A parser that also exposes its field shape, so schemas can be composed. */
export type ObjectParser<T> = Parser<T> & {
  readonly shape: Record<string, Parser<unknown>>
}

type ParserValue<P> = P extends Parser<infer V> ? V : never

function fail(issues: Issue[], path: string, message: string): undefined {
  issues.push({ path, message })
  return undefined
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function describe(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

// -------------------------------------------------------------- scalar parsers
export function string(options: {
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  patternMessage?: string
} = {}): Parser<string> {
  const { minLength = 0, maxLength = Number.MAX_SAFE_INTEGER, pattern } = options
  return (value, path, issues) => {
    if (typeof value !== 'string') {
      return fail(issues, path, `expected string, received ${describe(value)}`)
    }
    if (value.length < minLength) {
      return fail(issues, path, `must be at least ${minLength} character(s)`)
    }
    if (value.length > maxLength) {
      return fail(issues, path, `must be at most ${maxLength} characters`)
    }
    if (pattern && !pattern.test(value)) {
      return fail(issues, path, options.patternMessage ?? 'has an invalid format')
    }
    return value
  }
}

export function boolean(): Parser<boolean> {
  return (value, path, issues) =>
    typeof value === 'boolean'
      ? value
      : fail(issues, path, `expected boolean, received ${describe(value)}`)
}

export function integer(options: { min?: number; max?: number } = {}): Parser<number> {
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = options
  return (value, path, issues) => {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return fail(issues, path, `expected an integer, received ${describe(value)}`)
    }
    if (value < min || value > max) {
      return fail(issues, path, `must be between ${min} and ${max}`)
    }
    return value
  }
}

export function oneOf<const T extends readonly string[]>(allowed: T): Parser<T[number]> {
  const permitted = new Set<string>(allowed)
  return (value, path, issues) => {
    if (typeof value !== 'string') {
      return fail(issues, path, `expected one of ${allowed.join(', ')}, received ${describe(value)}`)
    }
    if (!permitted.has(value)) {
      return fail(issues, path, `must be one of ${allowed.join(', ')}, received "${value}"`)
    }
    return value as T[number]
  }
}

export function literalNull(): Parser<null> {
  return (value, path, issues) =>
    value === null ? null : fail(issues, path, `expected null, received ${describe(value)}`)
}

// ---------------------------------------------------------- composite parsers
/** Allows null; otherwise delegates. */
export function nullable<T>(inner: Parser<T>): Parser<T | null> {
  return (value, path, issues) => {
    if (value === null) return null
    const parsed = inner(value, path, issues)
    return parsed === undefined ? undefined : parsed
  }
}

export function list<T>(inner: Parser<T>, options: { maxItems?: number } = {}): Parser<T[]> {
  const { maxItems = Number.MAX_SAFE_INTEGER } = options
  return (value, path, issues) => {
    if (!Array.isArray(value)) {
      return fail(issues, path, `expected an array, received ${describe(value)}`)
    }
    if (value.length > maxItems) {
      return fail(issues, path, `must contain at most ${maxItems} item(s)`)
    }
    const parsed: T[] = []
    let valid = true
    value.forEach((item, index) => {
      const result = inner(item, `${path}[${index}]`, issues)
      if (result === undefined) {
        valid = false
        return
      }
      parsed.push(result)
    })
    return valid ? parsed : undefined
  }
}

/**
 * Localized content: exactly the keys `en` and `ar`, both strings.
 * `en` must be non-empty; `ar` may be empty to mean "translation pending".
 * Mirrors the isLocalized() helper in firestore.rules.
 */
export function localized(maxLength: number): Parser<LocalizedText> {
  return (value, path, issues) => {
    if (!isPlainObject(value)) {
      return fail(
        issues,
        path,
        `expected an object with "en" and "ar", received ${describe(value)}`,
      )
    }
    const unexpected = Object.keys(value).filter((key) => key !== 'en' && key !== 'ar')
    if (unexpected.length > 0) {
      issues.push({ path, message: `unexpected key(s): ${unexpected.join(', ')}` })
    }
    const en = string({ minLength: 1, maxLength })(value.en, `${path}.en`, issues)
    const ar = string({ maxLength })(value.ar, `${path}.ar`, issues)
    if (en === undefined || ar === undefined) return undefined
    return { en, ar }
  }
}

/**
 * A Firestore server timestamp.
 *
 * Checked structurally (integer `seconds` and `nanoseconds`) rather than with
 * `instanceof`: class identity is not reliable across SDK realms, and a runtime
 * import of the Firestore SDK would defeat the point of a dependency-free
 * validation layer.
 */
export function timestamp(): Parser<Timestamp> {
  return (value, path, issues) => {
    if (!isPlainObject(value)) {
      return fail(issues, path, `expected a Firestore Timestamp, received ${describe(value)}`)
    }
    const { seconds, nanoseconds } = value as { seconds?: unknown; nanoseconds?: unknown }
    if (typeof seconds !== 'number' || !Number.isInteger(seconds)) {
      return fail(issues, path, 'expected a Firestore Timestamp with integer "seconds"')
    }
    if (typeof nanoseconds !== 'number' || !Number.isInteger(nanoseconds)) {
      return fail(issues, path, 'expected a Firestore Timestamp with integer "nanoseconds"')
    }
        return value as unknown as Timestamp
  }
}

// ------------------------------------------------------------ domain parsers
/** Mirrors the isSlug() helper and the projects/services document-id rule. */
export function slug(): Parser<string> {
  return (value, path, issues) => {
    const parsed = string({ minLength: 1, maxLength: MAX_SLUG_LENGTH })(value, path, issues)
    if (parsed === undefined) return undefined
    if (!isValidSlug(parsed)) {
      return fail(issues, path, 'must be lowercase alphanumerics separated by single dashes')
    }
    return parsed
  }
}

/** Identical to the path pattern used by isMediaPath() in firestore.rules. */
const MEDIA_PATH_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*(\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/

export function mediaPath(): Parser<string> {
  return string({
    minLength: 1,
    maxLength: 512,
    pattern: MEDIA_PATH_PATTERN,
    patternMessage: 'must be a storage path with no traversal or leading slash',
  })
}

/** Mirrors isExternalUrl(): https only, so javascript:/data: cannot be stored. */
export function httpsUrl(): Parser<string> {
  return string({
    minLength: 1,
    maxLength: 2048,
    pattern: /^https:\/\/.+/,
    patternMessage: 'must be an https:// URL',
  })
}

// ------------------------------------------------------------ object parsers
/**
 * Exact-shape object parser. Unexpected fields are rejected, mirroring the
 * `keysAre()` check in firestore.rules so an extra field fails in both layers.
 */
export function object<S extends Record<string, Parser<unknown>>>(
  shape: S,
): ObjectParser<{ [K in keyof S]: ParserValue<S[K]> }> {
  type Parsed = { [K in keyof S]: ParserValue<S[K]> }

  const parser = (value: unknown, path: string, issues: Issue[]): Parsed | undefined => {
    if (!isPlainObject(value)) {
      return fail(issues, path, `expected an object, received ${describe(value)}`)
    }
    const unexpected = Object.keys(value).filter((key) => !(key in shape))
    if (unexpected.length > 0) {
      issues.push({ path, message: `unexpected field(s): ${unexpected.join(', ')}` })
    }
    const out: Record<string, unknown> = {}
    let valid = unexpected.length === 0
    for (const key of Object.keys(shape)) {
      const parsed = shape[key](value[key], path === '' ? key : `${path}.${key}`, issues)
      if (parsed === undefined) {
        valid = false
        continue
      }
      out[key] = parsed
    }
    return valid ? (out as Parsed) : undefined
  }

  return Object.assign(parser as ObjectParser<Parsed>, { shape })
}

/**
 * Adds the server-managed timestamps to an input shape, so the document schema
 * is derived from the input schema and the two can never drift apart.
 */
export function withTimestamps<T extends object>(
  inner: ObjectParser<T>,
): ObjectParser<T & DocumentTimestamps> {
  return object({
    ...inner.shape,
    createdAt: timestamp(),
    updatedAt: timestamp(),
  }) as unknown as ObjectParser<T & DocumentTimestamps>
}

/** Runs a parser and reports either the value or the collected issues. */
export function validate<T>(
  parser: Parser<T>,
  value: unknown,
  path = 'document',
): ValidationResult<T> {
  const issues: Issue[] = []
  const parsed = parser(value, path, issues)
  if (parsed === undefined || issues.length > 0) {
    return { ok: false, issues }
  }
  return { ok: true, value: parsed }
}

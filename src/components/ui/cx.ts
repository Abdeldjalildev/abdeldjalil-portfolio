export type ClassValue = string | false | null | undefined

/**
 * Joins class names and drops falsy values.
 * Kept dependency-free on purpose: the design system must not require a package for this.
 */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
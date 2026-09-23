export class CmsValidationError extends Error {
  constructor(public readonly issues: readonly { path: string; message: string }[]) {
    super('The submitted content is invalid.')
    this.name = 'CmsValidationError'
  }
}

export class CmsConflictError extends Error {
  constructor() {
    super('This content changed while you were editing it. Reload it before saving again.')
    this.name = 'CmsConflictError'
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof CmsValidationError) {
    return error.issues.map((issue) => `${issue.path}: ${issue.message}`).join(' ')
  }
  if (error instanceof CmsConflictError) return error.message
  return fallback
}

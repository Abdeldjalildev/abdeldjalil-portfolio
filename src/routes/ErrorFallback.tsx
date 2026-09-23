import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Button } from '../components/ui/Button.tsx'

/**
 * Phase 03 — Application error fallback.
 *
 * Renders a controlled, safe fallback for route-level errors instead of an
 * unhandled blank screen. No internal implementation details (stack traces,
 * raw error text, route paths) are exposed to the end user.
 */
export default function ErrorFallback() {
  const error = useRouteError()

  let title = 'Something went wrong'
  let message =
    'An unexpected error occurred. You can try navigating away and back, or reloading the page.'

  if (typeof error === 'string') {
    title = error
  } else if (error && error instanceof Error) {
    title = error.message || title
  } else if (isRouteErrorResponse(error)) {
    title = `Error: ${error.status} ${error.statusText || ''}`.trim()
    message = error.data as string | undefined
      ? String(error.data).slice(0, 280)
      : message
  }

  return (
    <div
      role="alert"
      className="m-6 flex flex-col gap-3 self-start rounded-lg border border-error bg-surface-elevated p-5 text-error-foreground"
    >
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm opacity-85">{message}</p>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => window.location.assign('/')}
      >
        Return home
      </Button>
    </div>
  )
}

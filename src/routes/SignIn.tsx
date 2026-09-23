import { useState } from 'react'
import { getAuth, signInWithPopup, GoogleAuthProvider, type AuthError } from 'firebase/auth'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFirebaseApp } from '../firebase/app.ts'
import { Button } from '../components/ui/Button.tsx'
import { Surface } from '../components/ui/Surface.tsx'

const FRIENDLY_AUTH_ERRORS: Record<string, string> = {
  'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
  'auth/popup-blocked': 'The sign-in popup was blocked. Please allow popups and try again.',
  'auth/account-exists-with-different-credential':
    'This Google account is already linked to another sign-in method.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
}

/**
 * Phase 04 — Sign-in page.
 *
 * Real Firebase Authentication entry point using the Google provider.
 * - Uses the installed firebase SDK (modular API).
 * - No client-side password handling, no stored credentials.
 * - Sanitized user-facing error messages (never exposes raw Firebase internals).
 * - Safe redirect after sign-in: returns to the pre-sign-in destination if
 *   the user was sent here by AdminAccessBoundary.
 * - Duplicate submission prevention via the `loading` flag.
 */
export default function SignIn() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    try {
      const auth = getAuth(getFirebaseApp())
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Force-refresh the ID token so any custom claims (admin role) set
      // since the last sign-in are reflected immediately.
      await result.user.getIdTokenResult(true)

      // Redirect to the pre-sign-in destination, or /admin by default.
      // `location.state` carries { from, intended } from AdminAccessBoundary.
      const state = location.state as { from?: string; intended?: boolean } | null
      const redirectTo =
        state?.intended === true && state.from ? state.from : '/admin'

      void navigate(redirectTo, { replace: true })
    } catch (e) {
      const authError = e as AuthError
      setError(
        FRIENDLY_AUTH_ERRORS[authError.code] ??
          'Unable to sign in. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <Surface
        variant="elevated"
        padding="lg"
        rounded="xl"
        className="w-full max-w-sm space-y-6 text-center"
      >
        <h1 className="text-h3 font-semibold text-foreground">
          Portfolio Admin
        </h1>
        <p className="text-sm text-foreground-muted">
          Sign in with your organization Google account.
        </p>
        {error && (
          <p
            role="alert"
            className="rounded-md bg-error/15 px-3 py-2 text-sm text-error-foreground"
          >
            {error}
          </p>
        )}
        <Button
          size="lg"
          className="w-full"
          disabled={loading}
          onClick={() => {
            void handleSignIn()
          }}
        >
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </Button>
      </Surface>
    </div>
  )
}

import { useState } from 'react'
import { getAuth, signInWithPopup, GoogleAuthProvider, type AuthError } from 'firebase/auth'
import { useLocation, useNavigate } from 'react-router-dom'
import { getFirebaseApp } from '../firebase/app.ts'
import { Button } from '../components/ui/Button.tsx'
import { Surface } from '../components/ui/Surface.tsx'
import { useI18n } from '../i18n/context.ts'
import type { TranslationKey } from '../i18n/types.ts'

const FRIENDLY_AUTH_ERRORS: Record<string, TranslationKey> = {
  'auth/popup-closed-by-user': 'sign_in_error_popup_closed',
  'auth/popup-blocked': 'sign_in_error_popup_blocked',
  'auth/account-exists-with-different-credential': 'sign_in_error_account_exists',
  'auth/network-request-failed': 'sign_in_error_network',
  'auth/too-many-requests': 'sign_in_error_too_many',
}

export default function SignIn() {
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()

  async function handleSignIn() {
    setLoading(true)
    setErrorKey(null)
    try {
      const auth = getAuth(getFirebaseApp())
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await result.user.getIdTokenResult(true)

      const state = location.state as { from?: string; intended?: boolean } | null
      const redirectTo = state?.intended === true && state.from ? state.from : '/admin'
      void navigate(redirectTo, { replace: true })
    } catch (e) {
      const authError = e as AuthError
      setErrorKey(FRIENDLY_AUTH_ERRORS[authError.code] ?? 'sign_in_error_generic')
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
        <h1 className="text-h3 font-semibold text-foreground">{t('sign_in_title')}</h1>
        <p className="text-sm text-foreground-muted">{t('sign_in_prompt')}</p>
        {errorKey && (
          <p role="alert" className="rounded-md bg-error/15 px-3 py-2 text-sm text-error-foreground">
            {t(errorKey)}
          </p>
        )}
        <Button
          size="lg"
          className="w-full"
          disabled={loading}
          onClick={() => void handleSignIn()}
        >
          {loading ? t('sign_in_loading') : t('sign_in_button')}
        </Button>
      </Surface>
    </div>
  )
}

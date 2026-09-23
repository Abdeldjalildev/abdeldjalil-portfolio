import { Outlet } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import { getFirebaseApp } from '../firebase/app.ts'
import { Button } from '../components/ui/Button.tsx'
import { Container } from '../components/ui/Container.tsx'
import { useAuth } from '../auth/context.ts'
import { useI18n } from '../i18n/context.ts'

export default function AdminLayout() {
  const { state } = useAuth()
  const { t } = useI18n()

  async function handleSignOut() {
    const auth = getAuth(getFirebaseApp())
    await signOut(auth)
  }

  return (
    <>
      <header className="border-b border-border-strong bg-surface-elevated py-3">
        <Container width="content">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">
              {t('route_dashboard')}
            </span>
            {state.status === 'authenticated' && (
              <Button variant="ghost" size="sm" onClick={() => void handleSignOut()}>
                {t('sign_out')}
              </Button>
            )}
          </div>
        </Container>
      </header>
      <Container as="main" width="content" className="min-h-[calc(100dvh-4rem)] py-8">
        <Outlet />
      </Container>
    </>
  )
}

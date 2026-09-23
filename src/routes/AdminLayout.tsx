import { Outlet } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import { getFirebaseApp } from '../firebase/app.ts'
import { Button } from '../components/ui/Button.tsx'
import { Container } from '../components/ui/Container.tsx'
import { useAuth } from '../auth/context.ts'

/**
 * Phase 04 â€” Admin shell layout.
 *
 * Structural shell for authenticated admin content. Authentication/authorization
 * enforcement lives in AdminAccessBoundary (the parent route guard). This layout
 * provides:
 *  - an admin content container (guttered, consistent with PublicLayout),
 *  - a main content boundary,
 *  - a structural sign-out control,
 *  - slots for a future admin sidebar / header (Phase 12).
 *
 * Sign-out uses Firebase Auth's native signOut â€” it clears the session
 * through Firebase's own lifecycle. No manual localStorage deletion.
 */
export default function AdminLayout() {
  async function handleSignOut() {
    const auth = getAuth(getFirebaseApp())
    await signOut(auth)
    // After sign-out, AuthProvider observes the state change and AdminAccessBoundary
    // redirects to /sign-in.
  }

  const { state } = useAuth()

  return (
    <>
      {/* future: <AdminHeader with sign-out slot /> */}
      <header className="border-b border-border-strong bg-surface-elevated py-3">
        <Container width="content">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground-muted">
              Admin
            </span>
            {state.status === 'authenticated' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void handleSignOut()
                }}
              >
                Sign out
              </Button>
            )}
          </div>
        </Container>
      </header>
      {/* future: <AdminSidebar /> */}
      <Container
        as="main"
        width="content"
        className="min-h-[calc(100dvh-4rem)] py-8"
      >
        <Outlet />
      </Container>
    </>
  )
}

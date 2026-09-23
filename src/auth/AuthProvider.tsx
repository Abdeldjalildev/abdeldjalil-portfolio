import { type ReactNode, useEffect, useState, useCallback } from 'react'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { getFirebaseApp } from '../firebase/app.ts'
import { AuthContext, type AuthState } from './context.ts'
import type { Claims } from './types.ts'

/**
 * Reads the current user's admin claim from the ID token.
 * Uses forceRefresh=false for background checks; callers needing immediate
 * freshness after a role change call refetch() which forces refresh.
 */
async function loadClaims(user: User, forceRefresh = false): Promise<Claims> {
  const token = await user.getIdTokenResult(forceRefresh)
  return {
    admin: token.claims.admin === true,
  }
}

/**
 * Phase 04 — Firebase Auth provider.
 *
 * Mounts once at the application root (src/main.tsx). Observes sign-in
 * state changes via onAuthStateChanged and exposes { state, refetch }.
 * No role assignment, no token persistence, no localStorage — Firebase
 * Auth handles its own session persistence.
 */
export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  const refetch = useCallback(async (): Promise<void> => {
    const auth = getAuth(getFirebaseApp())
    const user = auth.currentUser
    if (!user) {
      setState({ status: 'unauthenticated' })
      return
    }
    // forceRefresh=true: picks up an admin claim granted *after* this session's
    // ID token was issued. Claims only ever originate server-side, so this can
    // never escalate privileges on its own — it only re-reads the trusted claim.
    setState({
      status: 'authenticated',
      user,
      claims: await loadClaims(user, true),
    })
  }, [])

  useEffect(() => {
    const auth = getAuth(getFirebaseApp())
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ status: 'unauthenticated' })
        return
      }
      try {
        const claims = await loadClaims(user)
        setState({ status: 'authenticated', user, claims })
      } catch {
        // Token read failed — treat as unauthenticated rather than
        // granting access on uncertainty (deny-by-default).
        setState({ status: 'unauthenticated' })
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ state, refetch }}>{children}</AuthContext.Provider>
  )
}

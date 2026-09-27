import { type ReactNode, useEffect, useRef, useState, useCallback } from 'react'
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
  const authRequestRef = useRef(0)

  const refetch = useCallback(async (): Promise<void> => {
    const auth = getAuth(getFirebaseApp())
    const requestId = ++authRequestRef.current
    const user = auth.currentUser

    // A manual refresh is an authorization-state transition. Do not retain
    // previously trusted claims while the forced token read is in flight.
    setState({ status: 'loading' })

    if (!user) {
      if (requestId === authRequestRef.current) {
        setState({ status: 'unauthenticated' })
      }
      return
    }

    try {
      // forceRefresh=true: picks up an admin claim granted *after* this
      // session's ID token was issued. Claims only ever originate server-side,
      // so this can never escalate privileges on its own — it only re-reads
      // the trusted claim.
      const claims = await loadClaims(user, true)

      // Ignore a result from an older refresh/auth transition. This prevents
      // stale claims from overwriting newer auth state.
      if (requestId !== authRequestRef.current) return

      const currentUser = auth.currentUser
      if (!currentUser || currentUser.uid !== user.uid) return

      setState({ status: 'authenticated', user, claims })
    } catch {
      // Token refresh failed. Never retain stale authorization state or treat
      // an uncertain claim read as success; deny access until Auth produces a
      // newer, valid state.
      if (requestId === authRequestRef.current) {
        setState({ status: 'unauthenticated' })
      }
    }
  }, [])

  useEffect(() => {
    const auth = getAuth(getFirebaseApp())
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const requestId = ++authRequestRef.current

      // Publish a deny-by-default transition while claims for the new auth
      // identity are being read.
      setState({ status: 'loading' })

      if (!user) {
        setState({ status: 'unauthenticated' })
        return
      }

      try {
        const claims = await loadClaims(user)

        // A later sign-in/sign-out transition (or manual refetch) owns the
        // current auth state. Never let this older async result overwrite it.
        if (requestId !== authRequestRef.current) return

        const currentUser = auth.currentUser
        if (!currentUser || currentUser.uid !== user.uid) return

        setState({ status: 'authenticated', user, claims })
      } catch {
        // Token read failed — treat the state as unauthenticated rather than
        // granting access on uncertainty (deny-by-default).
        if (requestId === authRequestRef.current) {
          setState({ status: 'unauthenticated' })
        }
      }
    })

    return () => {
      // Invalidate any in-flight claim read before unsubscribing so its result
      // cannot publish state after the provider lifecycle has ended.
      ++authRequestRef.current
      unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ state, refetch }}>{children}</AuthContext.Provider>
  )
}

import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import type { Claims } from './types.ts'

/**
 * Phase 04 — Authentication context contract.
 *
 * Kept in a standalone module so AuthProvider.tsx exports only a component
 * (react-refresh) while routes and layouts share the hook.
 */
export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: User; claims: Claims }

export type AuthContextValue = {
  state: AuthState
  refetch: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Consumes the auth state published by <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return ctx
}

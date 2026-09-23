import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'

function readVariable(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Reads the Firebase Web App configuration from Vite environment variables.
 * These values are public client configuration; authorization is enforced by Firebase
 * security rules in later phases, never by hiding them.
 */
function readFirebaseOptions(): FirebaseOptions {
  const apiKey = readVariable(import.meta.env.VITE_FIREBASE_API_KEY)
  const authDomain = readVariable(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
  const projectId = readVariable(import.meta.env.VITE_FIREBASE_PROJECT_ID)
  const storageBucket = readVariable(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)
  const messagingSenderId = readVariable(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID)
  const appId = readVariable(import.meta.env.VITE_FIREBASE_APP_ID)

  const missingVariables = [
    !apiKey && 'VITE_FIREBASE_API_KEY',
    !authDomain && 'VITE_FIREBASE_AUTH_DOMAIN',
    !projectId && 'VITE_FIREBASE_PROJECT_ID',
    !storageBucket && 'VITE_FIREBASE_STORAGE_BUCKET',
    !messagingSenderId && 'VITE_FIREBASE_MESSAGING_SENDER_ID',
    !appId && 'VITE_FIREBASE_APP_ID',
  ].filter((name): name is string => typeof name === 'string')

  if (missingVariables.length > 0) {
    throw new Error(
      `Firebase configuration is incomplete. Missing environment variable(s): ${missingVariables.join(
        ', ',
      )}. Copy .env.example to .env.local and provide the Firebase Web App values.`,
    )
  }

  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }
}

/**
 * Returns the initialized Firebase app, creating it on first use (safe for Vite HMR reloads).
 * Phase 01 initializes the Firebase app only; Firebase products (Auth, Firestore, Storage,
 * Functions, Analytics, App Check) are deliberately not set up yet.
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp()
  }

  return initializeApp(readFirebaseOptions())
}

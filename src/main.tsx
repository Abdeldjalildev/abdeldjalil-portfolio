import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getFirebaseApp } from './firebase/app.ts'

// Phase 01 bootstrap boundary: initialize the Firebase app only.
// Firebase products (Auth, Firestore, Storage, Functions, Analytics) are intentionally not set up yet.
getFirebaseApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

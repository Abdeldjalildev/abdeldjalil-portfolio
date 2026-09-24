import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initializeConfiguredAppCheck } from './firebase/appCheck.ts'

initializeConfiguredAppCheck()
import App from './App.tsx'
import { getFirebaseApp } from './firebase/app.ts'

// Firebase bootstrap boundary: initialize the client app and optional App Check early.
// Feature-specific Firebase products remain lazy and are initialized at their data-access boundaries.
getFirebaseApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

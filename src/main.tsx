import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID,
)

const root = createRoot(document.getElementById('root')!)

// Dynamic imports here matter: statically importing App would pull in lib/firebase.ts,
// which throws synchronously (auth/invalid-api-key) when .env is unfilled — before
// React ever gets to render anything, i.e. a blank page with no visible error.
if (isFirebaseConfigured) {
  void import('./App.tsx').then(({ App }) => {
    root.render(
      <StrictMode>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </StrictMode>,
    )
  })
} else {
  void import('./app/ConfigMissingScreen.tsx').then(({ ConfigMissingScreen }) => {
    root.render(
      <StrictMode>
        <ConfigMissingScreen />
      </StrictMode>,
    )
  })
}

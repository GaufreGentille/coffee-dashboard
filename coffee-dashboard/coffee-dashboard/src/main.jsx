import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CommunityAuthProvider } from './components/CommunityAuth.jsx'

// Le Studio (caméra du téléphone et vue OBS) ne sert qu'aux pages #studio-*.
// Chargé à la demande, il ne pèse plus sur le site public.
const StudioCam = lazy(() => import('./pages/StudioCam.jsx'))
const StudioView = lazy(() => import('./pages/StudioView.jsx'))

const hash = window.location.hash

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {hash.startsWith('#studio-cam') ? <Suspense fallback={null}><StudioCam /></Suspense>
      : hash.startsWith('#studio-view') ? <Suspense fallback={null}><StudioView /></Suspense>
      : <CommunityAuthProvider><App /></CommunityAuthProvider>}
  </React.StrictMode>,
)

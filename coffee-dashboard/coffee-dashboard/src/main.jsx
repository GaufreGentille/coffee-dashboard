import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CommunityAuthProvider } from './components/CommunityAuth.jsx'
import StudioCam from './pages/StudioCam.jsx'
import StudioView from './pages/StudioView.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {window.location.hash.startsWith('#studio-cam') ? <StudioCam />
      : window.location.hash.startsWith('#studio-view') ? <StudioView />
      : <CommunityAuthProvider><App /></CommunityAuthProvider>}
  </React.StrictMode>,
)

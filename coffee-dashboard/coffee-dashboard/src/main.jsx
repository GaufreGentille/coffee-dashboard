import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import StudioCam from './pages/StudioCam.jsx'
import StudioView from './pages/StudioView.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {window.location.hash.startsWith('#studio-cam') ? <StudioCam />
      : window.location.hash.startsWith('#studio-view') ? <StudioView />
      : <App />}
  </React.StrictMode>,
)

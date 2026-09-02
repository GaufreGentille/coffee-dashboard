import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import StudioCam from './pages/StudioCam.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {window.location.hash === '#studio-cam' ? <StudioCam /> : <App />}
  </React.StrictMode>,
)

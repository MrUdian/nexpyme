import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { GiroProvider } from './context/GiroContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GiroProvider>
          <App />
        </GiroProvider>
      </AuthProvider>
    </BrowserRouter>
    {/* Cuenta visitas cuando la página está publicada en Vercel (actívalo en el panel de Vercel) */}
    <Analytics />
  </StrictMode>,
)

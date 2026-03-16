import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { EmergencyProvider } from './context/EmergencyContext.jsx'
import { Buffer } from 'buffer'
import process from 'process'

if (typeof window !== 'undefined') {
  window.Buffer = Buffer
  window.process = process
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EmergencyProvider>
          <App />
        </EmergencyProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

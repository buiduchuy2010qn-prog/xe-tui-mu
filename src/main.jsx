import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './pink-theme.css'
import './pink-effects.css'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { MascotBuddy } from './world/MascotBuddy.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <MascotBuddy />
    </ErrorBoundary>
  </StrictMode>,
)

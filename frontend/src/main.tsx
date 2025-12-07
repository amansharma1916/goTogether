import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ParticleTheme from './theme/ParticleTheme.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ParticleTheme />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

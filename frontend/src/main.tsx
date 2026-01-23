import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ParticleTheme from './theme/ParticleTheme.tsx'
import { NotificationProvider } from './context/NotificationContext'
import { GlobalLoaderProvider } from './context/GlobalLoaderContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ParticleTheme />
    <NotificationProvider>
      <GlobalLoaderProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GlobalLoaderProvider>
    </NotificationProvider>
  </StrictMode>,
)

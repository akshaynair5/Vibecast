import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthContextProvider } from './contextProvider.jsx'
import ErrorBoundary from './services/errorBoundary.js'

createRoot(document.getElementById('root')).render(
  <AuthContextProvider>
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  </AuthContextProvider>,
)

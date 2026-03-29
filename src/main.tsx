import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import CareerAI from './CareerAI.jsx'

const path = window.location.pathname;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {path.includes('career') ? <CareerAI /> : <App />}
  </StrictMode>
)

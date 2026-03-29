import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import CareerAI from './CareerAI.jsx'

var path = window.location.pathname;
var Component = path.indexOf('career') !== -1 ? CareerAI : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Component />
  </StrictMode>
)

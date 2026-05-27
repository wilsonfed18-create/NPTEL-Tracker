import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/*
 * FILE EXPLANATION:
 * This is the entry point of the React application.
 * It finds the <div id="root"> in index.html and renders our App component inside it.
 * StrictMode helps catch potential problems during development (no effect in production).
 * index.css imports Tailwind CSS styles.
 */

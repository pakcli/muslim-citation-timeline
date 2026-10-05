import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const roots = new WeakMap()

// Host API: the static site calls window.MCTJourney.mount(element) once.
function mount(el) {
  if (!el || roots.has(el)) return
  const root = createRoot(el)
  roots.set(el, root)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

window.MCTJourney = { mount }

// Standalone dev (npm run dev): index.html provides #root.
const devRoot = document.getElementById('root')
if (devRoot) mount(devRoot)

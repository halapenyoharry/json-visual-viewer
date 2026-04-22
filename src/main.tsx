import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import './index.css'
import App from './App.tsx'
import { useStore } from './store/useStore.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// VS Code extension bridge: receive JSON posted from the extension host
window.addEventListener('message', (event: MessageEvent) => {
  const msg = event.data as { type?: string; json?: string };
  if (msg.type === 'setJson' && typeof msg.json === 'string') {
    useStore.getState().setJson(msg.json);
  }
});

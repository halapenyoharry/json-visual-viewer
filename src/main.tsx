import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fonts.css'
import './index.css'
import './monacoSetup.ts'
import App from './App.tsx'
import { useStore } from './store/useStore.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

interface VsCodeApi {
  postMessage(msg: unknown): void
  getState(): unknown
  setState(state: unknown): void
}

const acquire = (window as Window & {
  acquireVsCodeApi?: () => VsCodeApi
}).acquireVsCodeApi

const vscode: VsCodeApi | null = typeof acquire === 'function' ? acquire() : null

let lastTextFromHost: string | null = null
let lastTextSentToHost: string | null = null

window.addEventListener('message', (event: MessageEvent) => {
  const msg = event.data as { type?: string; json?: string }
  if (msg.type === 'setJson' && typeof msg.json === 'string') {
    lastTextFromHost = msg.json
    if (msg.json !== useStore.getState().json) {
      useStore.getState().setJson(msg.json)
    }
  }
})

if (vscode) {
  let timer: number | undefined
  useStore.subscribe((state, prev) => {
    if (state.json === prev.json) return
    if (state.json === lastTextFromHost) return
    if (state.json === lastTextSentToHost) return
    if (timer !== undefined) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      lastTextSentToHost = state.json
      vscode.postMessage({ type: 'edit', json: state.json })
    }, 120)
  })
  vscode.postMessage({ type: 'ready' })
}

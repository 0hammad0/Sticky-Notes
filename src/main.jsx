import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import NoteProvider from "./context/NoteContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <NoteProvider>
      <App />
    </NoteProvider>
  </StrictMode>,
)

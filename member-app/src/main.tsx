import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider, DataProvider } from './data/store'
import './index.css'

// import.meta.env.BASE_URL עוקב אחרי base ב-vite.config.ts (שונה בין dev ל-build,
// ראו שם) — כך שה-router תמיד תואם לנתיב שבו האפליקציה באמת מוגשת, בלי לשכפל את הערך כאן.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

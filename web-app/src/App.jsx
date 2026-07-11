import { HashRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import { IdentityProvider } from './context/IdentityContext.js'
import { ToastProvider } from './components/Toast.jsx'
import { ModalProvider } from './components/Modal.jsx'
import AppRoutes from './routes.jsx'

export default function App() {
  return (
    <AppProvider>
      <IdentityProvider>
        <ToastProvider>
          <ModalProvider>
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </ModalProvider>
        </ToastProvider>
      </IdentityProvider>
    </AppProvider>
  )
}

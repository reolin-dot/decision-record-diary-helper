import { HashRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import { IdentityProvider } from './context/IdentityContext.js'
import { ToastProvider } from './components/Toast.jsx'
import { ModalProvider } from './components/Modal.jsx'
import AppRoutes from './routes.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import ConnectionStatus from './components/ConnectionStatus.jsx'

export default function App() {
  return (
    <AppErrorBoundary>
      <ConnectionStatus />
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
    </AppErrorBoundary>
  )
}

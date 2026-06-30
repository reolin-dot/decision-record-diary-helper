import { HashRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { ModalProvider } from './components/Modal.jsx'
import AppRoutes from './routes.jsx'

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <ModalProvider>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </ModalProvider>
      </ToastProvider>
    </AppProvider>
  )
}

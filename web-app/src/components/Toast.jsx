import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const show = useCallback((message, options = {}) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type: options.type || 'none' })
    timerRef.current = setTimeout(() => {
      setToast(null)
      timerRef.current = null
    }, options.duration || 2000)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div className="toast-overlay">
          <div className={`toast-box toast-${toast.type}`}>
            {toast.type === 'success' && <span className="toast-icon">✅</span>}
            <span className="toast-text">{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

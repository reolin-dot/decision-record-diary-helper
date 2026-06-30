import { createContext, useContext, useState, useCallback } from 'react'

const ModalContext = createContext(null)

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null)

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setModal({
        title: options.title || '提示',
        content: options.content || '',
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        showCancel: options.showCancel !== false,
        onConfirm: () => {
          setModal(null)
          resolve(true)
        },
        onCancel: () => {
          setModal(null)
          resolve(false)
        },
      })
    })
  }, [])

  return (
    <ModalContext.Provider value={{ confirm }}>
      {children}
      {modal && (
        <div className="modal-overlay" onClick={modal.onCancel}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{modal.title}</h3>
            <p className="modal-content">{modal.content}</p>
            <div className="modal-actions">
              {modal.showCancel && (
                <button className="modal-btn modal-btn-cancel" onClick={modal.onCancel}>
                  {modal.cancelText}
                </button>
              )}
              <button className="modal-btn modal-btn-confirm" onClick={modal.onConfirm}>
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}

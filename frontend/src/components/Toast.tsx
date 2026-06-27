import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const isSuccess = toast.type === 'success'

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in-right"
      style={{
        background: 'var(--vault-elevated)',
        border: `1px solid ${isSuccess ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'}`,
      }}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--emerald)' }} />
      ) : (
        <XCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--crimson)' }} />
      )}
      <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
        {toast.message}
      </span>
      <button onClick={onDismiss} className="shrink-0 p-0.5 rounded transition-colors hover:bg-white/10">
        <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

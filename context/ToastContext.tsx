'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: number
  message: string
  type: ToastType
}

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let nextId = 1

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald shrink-0" />,
  error: <XCircle className="w-5 h-5 text-rose shrink-0" />,
  info: <Info className="w-5 h-5 text-gold shrink-0" />,
}

const BORDER: Record<ToastType, string> = {
  success: 'border-emerald/20',
  error: 'border-rose/30',
  info: 'border-gold/25',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => dismissToast(id), 3500)
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Stack */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200000] flex flex-col gap-2.5 w-[calc(100%-2.5rem)] max-w-sm px-0 pointer-events-none md:left-auto md:right-5 md:translate-x-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 bg-white rounded-2xl shadow-card border ${BORDER[toast.type]} px-4 py-3.5 animate-fade-in`}
          >
            {ICONS[toast.type]}
            <p className="flex-1 text-sm font-medium text-ink leading-snug">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-ink/40 hover:text-ink/70 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  title: string
  description?: string
  type?: ToastType
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, 'id'>) => void
}

const ToastContext = React.createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return React.useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const toast = React.useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...opts, id }])
  }, [])

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map(t => (
          <ToastPrimitive.Root
            key={t.id}
            defaultOpen
            duration={4000}
            onOpenChange={(open) => { if (!open) remove(t.id) }}
            className="flex items-start gap-3 p-4 rounded-xl shadow-lg border bg-white max-w-sm w-full
              data-[state=open]:animate-in data-[state=closed]:animate-out
              data-[state=closed]:fade-out-80 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]
              data-[state=open]:slide-in-from-bottom-4"
          >
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'error'   && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
            {(!t.type || t.type === 'info') && <Info className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="font-semibold text-sm text-[#0F172A]">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-xs text-slate-500 mt-0.5">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>

            <ToastPrimitive.Close
              className="p-0.5 rounded hover:bg-slate-100 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-slate-400" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport className="fixed bottom-20 md:bottom-4 right-4 flex flex-col gap-2 z-50 w-full max-w-sm px-4 sm:px-0" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

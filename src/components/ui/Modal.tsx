'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto',
            className
          )}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            {title && (
              <Dialog.Title className="font-display text-xl font-bold text-[#0F172A]">
                {title}
              </Dialog.Title>
            )}
            {description && (
              <Dialog.Description className="text-sm text-slate-500 mt-1">
                {description}
              </Dialog.Description>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors ml-auto"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

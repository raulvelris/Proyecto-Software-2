import { createPortal } from 'react-dom'
import { Button } from '../Button'

type ConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isProcessing?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isProcessing = false
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60" 
        onClick={!isProcessing ? onClose : undefined}
      />
      <div className="relative z-10 w-full max-w-md bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-white">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2"
          >
            {cancelText}
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2"
          >
            {isProcessing ? 'Procesando...' : confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
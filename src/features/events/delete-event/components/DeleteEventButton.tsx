import { useState } from 'react'
import { Button } from '../../../../components/Button.tsx'
import { ConfirmationModal } from '../../../../components/modals/ConfirmationModal'
import { deleteEvent } from '../service/DeleteEventService'
import { toast } from 'sonner'

interface DeleteEventButtonProps {
  eventoId: string | number
  onDeleted?: () => void
}

export function DeleteEventButton({ eventoId, onDeleted }: DeleteEventButtonProps) {
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await deleteEvent(eventoId)
      toast.success('Evento cancelado')
      onDeleted?.()
    } catch (e: any) {
      toast.error(e?.message || 'Error al cancelar el evento')
    } finally {
      setIsProcessing(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button 
        variant="danger" 
        onClick={() => setOpen(true)}
        disabled={isProcessing}
      >
        <i className="bi bi-x-circle me-2" />
        {isProcessing ? 'Cancelando...' : 'Cancelar Evento'}
      </Button>

      <ConfirmationModal
        isOpen={open}
        onClose={() => !isProcessing && setOpen(false)}
        onConfirm={handleConfirm}
        title="¿Estás seguro de cancelar el evento?"
        message="Esta acción no se puede deshacer. Los asistentes serán notificados de la cancelación."
        confirmText="Sí, cancelar evento"
        cancelText="No, mantener el evento"
        isProcessing={isProcessing}
      />
    </>
  )
}

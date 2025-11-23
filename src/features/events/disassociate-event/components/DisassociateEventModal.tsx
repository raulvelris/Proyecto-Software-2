import Modal from '../../../../components/Modal'
import { Button } from '../../../../components/Button.tsx'
import { toast } from 'sonner'
import { desvincularme } from '../service/DisassociateEventService'

interface DisassociateEventModalProps {
  open: boolean
  eventoId: number | null
  usuarioId: number | null
  onClose: () => void
  onSuccess?: () => void
}

export function DisassociateEventModal({
  open,
  eventoId,
  usuarioId,
  onClose,
  onSuccess,
}: DisassociateEventModalProps) {
  const handleConfirm = async () => {
    try {
      if (!eventoId || !usuarioId) return
      await desvincularme(eventoId, usuarioId)
      toast.success('Te has desvinculado del evento correctamente')
      onSuccess?.()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Error al desvincularte')
    } finally {
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="¿Estás seguro?"
      hideDefaultCloseButton
    >
      <p className="text-sm text-slate-400">
        ¿Estás seguro de desvincularte de este evento? Esta acción no se puede deshacer.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" onClick={handleConfirm}>
          Desvincularme
        </Button>
      </div>
    </Modal>
  )
}

import Modal from '../../../../components/Modal'
import { Button } from '../../../../components/Button.tsx'
import { toast } from 'sonner'
import { eliminarInvitado } from '../service/DeleteAttendeeService'
import { getParticipantesByEvento, type ParticipanteItem } from '../../participants-list/service/ParticipantsListService'

interface DeleteAttendeeModalProps {
  open: boolean
  eventoId: number | null
  participante: ParticipanteItem | null
  onClose: () => void
  onParticipantsUpdated?: (list: ParticipanteItem[]) => void
}

export function DeleteAttendeeModal({
  open,
  eventoId,
  participante,
  onClose,
  onParticipantsUpdated,
}: DeleteAttendeeModalProps) {
  const handleConfirm = async () => {
    try {
      if (!eventoId || !participante) return
      await eliminarInvitado(eventoId, Number(participante.usuario_id))
      toast.success('Participante eliminado correctamente')

      const res = await getParticipantesByEvento(eventoId)
      const list = (res.participantes || []) as ParticipanteItem[]
      onParticipantsUpdated?.(list)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Error al eliminar al participante')
    } finally {
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="¿Estás seguro de eliminar a este participante?"
      hideDefaultCloseButton
    >
      <p className="text-sm text-slate-400">
        ¿Estás seguro de eliminar a este participante? Esta acción no se puede deshacer.
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={handleConfirm}
        >
          Eliminar
        </Button>
      </div>
    </Modal>
  )
}

import { useState, useEffect, useCallback } from 'react';
import { Recurso, getRecursosByEvento, eliminarRecurso } from '../services/ResourcesService';
import { toast } from 'sonner';
import { ResourceOpenButton } from './ResourceOpenButton';
import Modal from '../../../../components/Modal';
import { Button } from '../../../../components/Button';

interface ResourcesSectionProps {
  eventoId: string;
  canManageResources?: boolean;
  refreshTrigger?: number;
}

export const ResourcesSection = ({ eventoId, canManageResources = false, refreshTrigger }: ResourcesSectionProps) => {
  const [resources, setResources] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Recurso | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Función para cargar recursos
  const loadResources = useCallback(async () => {
    try {
      setIsLoading(true);
      const recursos = await getRecursosByEvento(Number(eventoId));
      // Aseguramos que resources siempre sea un array
      setResources(Array.isArray(recursos) ? recursos : []);
    } catch (error) {
      console.error('Error al cargar recursos:', error);
      toast.error('No se pudieron cargar los recursos');
      setResources([]); // Aseguramos que resources sea un array vacío en caso de error
    } finally {
      setIsLoading(false);
    }
  }, [eventoId]);

  const closeDeleteModal = () => {
    setShowConfirmDelete(false);
    setResourceToDelete(null);
  };

  const handleDeleteResource = async () => {
    if (!resourceToDelete?.id) return;
    try {
      setDeletingId(resourceToDelete.id);
      await eliminarRecurso(eventoId, resourceToDelete.id);
      toast.success('Recurso eliminado');
      setResources(prev => prev.filter(r => r.id !== resourceToDelete.id));
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
      const message = error instanceof Error ? error.message : 'No se pudo eliminar el recurso';
      toast.error(message);
    } finally {
      setDeletingId(null);
      closeDeleteModal();
    }
  };

  // Cargar recursos al montar el componente, cuando cambie el evento o cuando cambie el trigger
  useEffect(() => {
    loadResources();
  }, [loadResources, refreshTrigger]);

  if (isLoading) {
    return <div className="text-slate-400">Cargando recursos...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recursos del evento</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !Array.isArray(resources) || resources.length === 0 ? (
        <div className="card p-5 text-center text-slate-400">
          <i className="bi bi-folder-x text-4xl mb-2"></i>
          <p>No hay recursos disponibles para este evento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((recurso) => {
            // Aseguramos que recurso y sus propiedades existan
            if (!recurso) return null;
            
            const recursoId = recurso.id || Math.random().toString(36).substr(2, 9);
            const nombre = recurso.nombre || 'Recurso sin nombre';
            const tipoRecurso = recurso.tipo_recurso?.nombre || 'desconocido';
            
            return (
              <div key={recursoId} className="card p-4 relative group hover:bg-slate-800 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate" title={nombre}>
                      {nombre}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Tipo: {tipoRecurso}
                    </p>
                  </div>
                  {canManageResources && recurso.id && (
                    <button
                      onClick={() => {
                        if (deletingId !== null) return;
                        setResourceToDelete(recurso);
                        setShowConfirmDelete(true);
                      }}
                      className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                      title="Eliminar recurso"
                      disabled={deletingId === recurso.id}
                    >
                      {deletingId === recurso.id ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className="animate-spin bi bi-arrow-repeat" />
                          Eliminando
                        </span>
                      ) : (
                        <i className="bi bi-trash" />
                      )}
                    </button>
                  )}
                </div>
                
                <div className="mt-3">
                  {recurso.url ? (
                    <ResourceOpenButton recurso={recurso} />
                  ) : (
                    <span className="text-slate-500 text-sm">Sin enlace disponible</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showConfirmDelete && resourceToDelete && (
        <Modal
          open={showConfirmDelete}
          onClose={closeDeleteModal}
          title="Eliminar recurso"
          hideDefaultCloseButton
        >
          <p className="text-sm text-slate-300">
            ¿Seguro que deseas eliminar "{resourceToDelete.nombre}"? Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={closeDeleteModal} disabled={deletingId === resourceToDelete.id}>
              Cancelar
            </Button>
            <Button variant="danger" type="button" onClick={handleDeleteResource} disabled={deletingId === resourceToDelete.id}>
              {deletingId === resourceToDelete.id ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

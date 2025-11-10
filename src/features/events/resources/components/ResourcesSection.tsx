import { useState, useEffect } from 'react';
import { Recurso, getRecursosByEvento, createRecurso, deleteRecurso } from '../../services/EventResourcesService';
import { toast } from 'sonner';

interface ResourcesSectionProps {
  eventoId: string;
  isOrganizer: boolean;
}

export const ResourcesSection = ({ eventoId, isOrganizer }: ResourcesSectionProps) => {
  const [resources, setResources] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    url: '',
    tipo_recurso: 'enlace', // 'enlace' o 'archivo'
    archivo: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar recursos al montar el componente
  useEffect(() => {
    let isMounted = true;
    
    const loadResources = async () => {
      try {
        setIsLoading(true);
        const recursos = await getRecursosByEvento(Number(eventoId));
        if (isMounted) {
          // Aseguramos que resources siempre sea un array
          setResources(Array.isArray(recursos) ? recursos : []);
        }
      } catch (error) {
        console.error('Error al cargar recursos:', error);
        if (isMounted) {
          toast.error('No se pudieron cargar los recursos');
          setResources([]); // Aseguramos que resources sea un array vacío en caso de error
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadResources();
    
    return () => {
      isMounted = false; // Limpieza para evitar actualizaciones en componentes desmontados
    };
  }, [eventoId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        archivo: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre del recurso es requerido');
      return;
    }

    if (formData.tipo_recurso === 'enlace' && !formData.url.trim()) {
      toast.error('La URL es requerida para recursos de tipo enlace');
      return;
    }

    if (formData.tipo_recurso === 'archivo' && !formData.archivo) {
      toast.error('Debes seleccionar un archivo');
      return;
    }

    try {
      setIsSubmitting(true);
      
      let newResource: Recurso;

      if (formData.tipo_recurso === 'archivo' && formData.archivo) {
        // Para archivos, crear FormData
        const formDataToSend = new FormData();
        formDataToSend.append('nombre', formData.nombre.trim());
        formDataToSend.append('tipo_recurso', '2');
        formDataToSend.append('evento_id', eventoId);
        formDataToSend.append('archivo', formData.archivo);
        formDataToSend.append('url', formData.archivo.name);

        newResource = await createRecurso(formDataToSend);
      } else {
        // Para enlaces, crear FormData
        const formDataToSend = new FormData();
        formDataToSend.append('nombre', formData.nombre.trim());
        formDataToSend.append('url', formData.url.trim());
        formDataToSend.append('tipo_recurso', '1');
        formDataToSend.append('evento_id', eventoId);
        
        newResource = await createRecurso(formDataToSend);
      }
      
      // Actualizar el estado con el nuevo recurso
      setResources(prev => [...prev, newResource]);
      
      // Resetear el formulario
      setFormData({
        nombre: '',
        url: '',
        tipo_recurso: 'enlace',
        archivo: null,
      });
      
      // Cerrar el formulario y mostrar mensaje de éxito
      setShowAddForm(false);
      toast.success('Recurso agregado correctamente');
      
    } catch (error) {
      console.error('Error al crear el recurso:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear el recurso';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este recurso?')) {
      return;
    }

    try {
      await deleteRecurso(id);
      setResources(prev => prev.filter(r => r.id !== id));
      toast.success('Recurso eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el recurso:', error);
      toast.error('Error al eliminar el recurso');
    }
  };

  if (isLoading) {
    return <div className="text-slate-400">Cargando recursos...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recursos del evento</h2>
        {isOrganizer && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? 'Cancelar' : 'Agregar recurso'}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="card p-5 mb-6">
          <h3 className="text-lg font-medium mb-4">Agregar nuevo recurso</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nombre del recurso *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white"
                placeholder="Ej: Presentación del evento"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Tipo de recurso *
              </label>
              <select
                name="tipo_recurso"
                value={formData.tipo_recurso}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white"
              >
                <option value="enlace">Enlace</option>
                <option value="archivo">Archivo</option>
              </select>
            </div>

            {formData.tipo_recurso === 'enlace' ? (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  URL del recurso *
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white"
                  placeholder="https://ejemplo.com/recurso"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Seleccionar archivo *
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Formatos permitidos: PDF, Word, Excel, PowerPoint, imágenes
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : 'Guardar recurso'}
              </button>
            </div>
          </form>
        </div>
      )}

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
            const esEnlace = tipoRecurso.toLowerCase() === 'enlace';
            
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
                  {isOrganizer && (
                    <button
                      onClick={() => recurso.id && handleDelete(recurso.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                      title="Eliminar recurso"
                      disabled={!recurso.id}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
                
                <div className="mt-3">
                  {recurso.url ? (
                    <a
                      href={recurso.url}
                      target={esEnlace ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                      download={!esEnlace}
                    >
                      <i className={`bi ${esEnlace ? 'bi-box-arrow-up-right' : 'bi-download'} mr-1`}></i>
                      {esEnlace ? 'Abrir enlace' : 'Descargar archivo'}
                    </a>
                  ) : (
                    <span className="text-slate-500 text-sm">Sin enlace disponible</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import { useState } from 'react';
import Modal from '../../../../components/Modal';
import { Button } from '../../../../components/Button';
import { createRecursoEnlace, createRecursoArchivo } from '../services/ResourcesService';
import { toast } from 'sonner';

interface AddResourceModalProps {
  open: boolean;
  onClose: () => void;
  eventoId: string;
  onResourceAdded?: () => void;
}

export function AddResourceModal({ open, onClose, eventoId, onResourceAdded }: AddResourceModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    url: '',
    tipo_recurso: 'enlace' as 'enlace' | 'archivo',
    archivo: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // Protección contra doble envío
    if (isSubmitting) {
      console.warn('Formulario ya se está enviando, ignorando...');
      return;
    }
    
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
      console.log('📤 Enviando request para crear recurso...');
      
      if (formData.tipo_recurso === 'enlace') {
        // SOLO JSON para enlaces
        await createRecursoEnlace(Number(eventoId), {
          nombre: formData.nombre.trim(),
          url: formData.url.trim(),
          tipo_recurso: '1'
        });
      } else {
        // FORM DATA (multipart) para archivos
        if (!formData.archivo) {
          throw new Error('Debes seleccionar un archivo');
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('nombre', formData.nombre.trim());
        formDataToSend.append('tipo_recurso', '2');
        formDataToSend.append('archivo', formData.archivo);
        
        await createRecursoArchivo(Number(eventoId), formDataToSend);
      }
      
      // Resetear el formulario
      setFormData({
        nombre: '',
        url: '',
        tipo_recurso: 'enlace',
        archivo: null,
      });
      
      // Cerrar el modal y mostrar mensaje de éxito
      toast.success('Recurso agregado correctamente');
      onResourceAdded?.();
      onClose();
      
    } catch (error) {
      console.error('Error al crear el recurso:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear el recurso';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Resetear el formulario al cerrar
    setFormData({
      nombre: '',
      url: '',
      tipo_recurso: 'enlace',
      archivo: null,
    });
    onClose();
  };

  return (
    <>
      {open && (
        <style>{`
          .fixed.inset-0.z-50 .card > div.mt-6.flex.justify-end.gap-2 {
            display: none !important;
          }
        `}</style>
      )}
      <Modal open={open} onClose={handleClose} title="Agregar nuevo recurso">
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
              name="archivo"
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
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar recurso'}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
}


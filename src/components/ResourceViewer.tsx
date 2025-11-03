// src/components/ResourceViewer.tsx
import React from 'react';
import { toast } from 'sonner';

interface ResourceViewerProps {
  resourceUrl: string;
  resourceType?: 'image' | 'document' | 'link' | 'unknown';
  onError?: (error: string) => void;
  className?: string;
}

const ResourceViewer: React.FC<ResourceViewerProps> = ({
  resourceUrl,
  resourceType = 'unknown',
  onError,
  className = '',
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Determinar el tipo de recurso basado en la extensión del archivo si no se proporciona
  const detectedType = React.useMemo(() => {
    if (resourceType !== 'unknown') return resourceType;
    
    const extension = resourceUrl.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    
    if (imageExtensions.includes(extension || '')) return 'image';
    if (documentExtensions.includes(extension || '')) return 'document';
    if (resourceUrl.startsWith('http')) return 'link';
    
    return 'unknown';
  }, [resourceUrl, resourceType]);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
    toast.error(errorMessage);
  };

  const handleOpenResource = () => {
    if (!resourceUrl) {
      handleError('No se proporcionó una URL de recurso');
      return;
    }

    try {
      if (detectedType === 'link' || detectedType === 'document') {
        // Abrir enlaces y documentos en una nueva pestaña
        window.open(resourceUrl, '_blank', 'noopener,noreferrer');
      } else if (detectedType === 'image') {
        // Para imágenes, podríamos mostrarlas en un modal o simplemente abrirlas
        const imageWindow = window.open('', '_blank');
        if (imageWindow) {
          imageWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Vista previa de imagen</title>
                <style>
                  body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #1e293b; }
                  img { max-width: 90vw; max-height: 90vh; object-fit: contain; }
                </style>
              </head>
              <body>
                <img src="${resourceUrl}" alt="Vista previa" onerror="document.body.innerHTML='<div style=\'color: white; font-family: Arial, sans-serif;\'>No se pudo cargar la imagen</div>'" />
              </body>
            </html>
          `);
          imageWindow.document.close();
        }
      } else {
        // Para tipos desconocidos, intentar abrir en una nueva pestaña
        window.open(resourceUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      handleError('Error al abrir el recurso');
      console.error('Error al abrir el recurso:', err);
    }
  };

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 text-red-700 p-4 rounded-md ${className}`}>
        <p>{error}</p>
      </div>
    );
  }

  // Mostrar vista previa si es una imagen
  if (detectedType === 'image' && !error) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={resourceUrl}
          alt="Vista previa del recurso"
          className="w-full h-auto rounded-md"
          onLoad={() => setIsLoading(false)}
          onError={() => handleError('No se pudo cargar la imagen')}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        <button
          onClick={handleOpenResource}
          className="absolute bottom-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
          title="Abrir imagen en tamaño completo"
        >
          <i className="bi bi-arrows-fullscreen"></i>
        </button>
      </div>
    );
  }

  // Para otros tipos de recursos, mostrar un botón de abrir
  return (
    <div className={`border border-gray-200 rounded-md p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{resourceUrl.split('/').pop() || 'Recurso'}</p>
          <p className="text-sm text-gray-500">
            {detectedType === 'document' ? 'Documento' : detectedType === 'link' ? 'Enlace' : 'Archivo'}
          </p>
        </div>
        <button
          onClick={handleOpenResource}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
        >
          <i className="bi bi-box-arrow-up-right mr-1"></i> Abrir
        </button>
      </div>
    </div>
  );
};

export default ResourceViewer;
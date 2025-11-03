// src/hooks/useResource.ts
import { useState, useCallback } from 'react';

type ResourceType = 'image' | 'document' | 'link' | 'unknown';

interface UseResourceOptions {
  onError?: (error: string) => void;
}

export const useResource = (options?: UseResourceOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openResource = useCallback(async (url: string, type?: ResourceType) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!url) {
        throw new Error('No se proporcionó una URL de recurso');
      }

      // Determinar el tipo de recurso si no se proporciona
      let resourceType = type;
      if (!resourceType) {
        const extension = url.split('.').pop()?.toLowerCase();
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
        
        if (imageExtensions.includes(extension || '')) {
          resourceType = 'image';
        } else if (documentExtensions.includes(extension || '')) {
          resourceType = 'document';
        } else if (url.startsWith('http')) {
          resourceType = 'link';
        } else {
          resourceType = 'unknown';
        }
      }

      // Abrir el recurso según su tipo
      if (resourceType === 'link' || resourceType === 'document') {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (resourceType === 'image') {
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
                <img src="${url}" alt="Vista previa" onerror="document.body.innerHTML='<div style=\'color: white; font-family: Arial, sans-serif;\'>No se pudo cargar la imagen</div>'" />
              </body>
            </html>
          `);
          imageWindow.document.close();
        }
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al abrir el recurso';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  return {
    openResource,
    isLoading,
    error,
  };
};
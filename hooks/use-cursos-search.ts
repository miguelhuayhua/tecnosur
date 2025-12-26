// hooks/use-cursos-search.ts
import { useState, useEffect } from 'react';

// Tipo simplificado solo con lo que devuelve /api/cursos/search
interface CursoSearch {
  id: number;
  titulo: string;
  descripcion: string;
  imagenUrl: string | null;
  ediciones: Array<{
    id: number;
    modalidad: string;
    precios: Array<{
      precio: number;
    }>;
  }>;
}

interface SearchResult {
  cursos: CursoSearch[];
  isLoading: boolean;
  error: any;
}

export function useCursosSearch(query: string, delay: number = 300): SearchResult {
  const [cursos, setCursos] = useState<CursoSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setCursos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const timeoutId = setTimeout(async () => {
      try {
        // Usar el endpoint optimizado
        const response = await fetch(`/api/cursos/search?q=${encodeURIComponent(query.trim())}`);
        
        if (!response.ok) {
          throw new Error('Error en la búsqueda');
        }

        const data = await response.json();
        setCursos(data.cursos || []);
        setError(null);
      } catch (err) {
        setError(err);
        setCursos([]);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, delay]);

  return { cursos, isLoading, error };
}
// hooks/useCursosSearch.ts
import { useState, useEffect } from 'react';

// Tipo simplificado según el schema real de Prisma
export interface CursoSearch {
  id: string; // ✅ UUID en el schema
  titulo: string;
  descripcion: string;
  urlMiniatura: string | null; // ✅ Campo correcto
  enVivo: boolean; // ✅ Para mostrar si es en vivo o grabado
  ediciones: Array<{
    id: string;
    codigo: string;
    fechaInicio: Date; // Puede venir como string del API
    fechaFin: Date | string;
    precios: Array<{
      precio: number;
      moneda: string;
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
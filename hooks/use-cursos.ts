// hooks/use-cursos.ts
import useSWR, { KeyedMutator } from 'swr';
import { categorias, categoriasCursos, clases, cursos, docente, edicionesCursos, objetivosCursos, preciosCursos, reviewsCursos, usuariosEstudiantes } from '@/prisma/generated';

// Definir la interfaz extendida para el curso con relaciones
export interface Cursos extends cursos {
  categorias: Array<categoriasCursos & { categoria: categorias }>;
  ediciones: Array<edicionesCursos & {
    _count: { clases: number },
    precios: Array<preciosCursos>; docente: docente,
    clases: Array<clases>,
  }>;
  reviews: Array<{ id: string, rating: number, comentario: string, creadoEn: Date } & {
    usuario: {
      correo: string, avatar: string | null, id: string
    }
  }>;
  objetivos: Array<objetivosCursos>
}

interface Filtros {
  search?: string;
  categoria?: string;
  precioMin?: string;
  precioMax?: string;
  fechaInicio?: string;
  enVivo?: string;
  descuento?: boolean;
  fechaFin?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CursosResponse {
  cursos: Cursos[];
  pagination: Pagination;
}

interface UseCursosReturn {
  cursos: Cursos[];
  pagination: Pagination;
  error: any;
  isLoading: boolean;
  mutate: KeyedMutator<CursosResponse>;
}

const fetcher = async (url: string): Promise<CursosResponse> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error fetching cursos');
  return response.json();
};
// hooks/useCursos.ts
// ... imports y interfaces anteriores ...

export function useCursos(filtros: Filtros = {}): UseCursosReturn {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      // Mapear sortBy a campos válidos
      if (key === 'sortBy') {
        const validSortFields: Record<string, string> = {
          'creadoEn': 'creadoEn',
          'titulo': 'titulo',
          'actualizadoEn': 'actualizadoEn',
          'fechaInicio': 'creadoEn' // Fallback a creadoEn si se solicita fechaInicio
        };
        params.append(key, validSortFields[value as string] || 'creadoEn');
      } else {
        params.append(key, value.toString());
      }
    }
  });

  const { data, error, isLoading, mutate } = useSWR<CursosResponse>(
    `/api/cursos?${params}`,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true
    }
  );
  return {
    cursos: data?.cursos || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    },
    error,
    isLoading,
    mutate
  };
}
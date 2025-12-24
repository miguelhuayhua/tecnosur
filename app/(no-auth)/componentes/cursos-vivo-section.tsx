'use client';

import { useCursos } from '@/hooks/use-cursos';
import { CursoCardDetalladoVerticalSkeleton } from '../static/curso-en-vivo-skeleton';
import { CursoCardDetalladoVertical } from './curso-en-vivo';

export default function List() {
  const { cursos, isLoading, error } = useCursos({
    limit: 3,
    sortBy: 'creadoEn',
    sortOrder: 'desc'
  });
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        {/* Header con título y status al lado */}
        <div className="mb-8 flex flex-col items-center justify-center">

          <h2 className="font-bold text-center  text-2xl">Cursos en vivo</h2>

          <p className="text-muted-foreground ">
            Cursos diseñados para que aprendas de manera sincronizada con el docente.
          </p>
        </div>

        {/* Cursos */}
        {error && (
          <div className="text-center py-4">
            <p className="text-destructive">Error al cargar los cursos</p>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <CursoCardDetalladoVerticalSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso) => (
              <CursoCardDetalladoVertical
                key={curso.id}
                curso={curso as any}
              />
            ))}

            {cursos.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No se encontraron cursos</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
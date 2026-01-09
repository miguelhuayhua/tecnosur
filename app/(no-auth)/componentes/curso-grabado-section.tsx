// componentes/list.tsx
'use client';

import { useCursos } from '@/hooks/use-cursos';
import { CursoGeneral } from './curso-general';
import { CursoGeneralSkeleton } from '../static/curso-general-skeleton';
import { InteractiveButton } from '@/components/ui/interactive-button';
import Link from 'next/link';

export default function ListGrabados() {
    const { cursos, isLoading, error } = useCursos({
        limit: 3,
        sortBy: 'creadoEn',
        sortOrder: 'desc',
        enVivo: 'false'
    });

    return (
        <section className="py-10">
            <div className="container mx-auto px-4">
                {/* Header con título y descripción */}
                <div className="mb-8 flex justify-between items-center">
                    <h2 className="font-bold   text-2xl">Cursos Grabados</h2>
                    <InteractiveButton >
                        <Link href="/cursos?enVivo=false">
                            Ver más
                        </Link>
                    </InteractiveButton>
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
                            <CursoGeneralSkeleton key={index} />
                        ))}
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {cursos.map((curso) => (
                            <CursoGeneral
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
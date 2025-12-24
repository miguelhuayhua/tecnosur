'use client';

import { useCursos } from "@/hooks/use-cursos";
import { CursoCard } from "./(componentes)/curso-card";

export default function ListarCursos() {
    const { cursos } = useCursos({
        limit: 20,
        sortBy: 'creadoEn',
        sortOrder: 'desc',

    });
    return (
        <div className="grid grid-cols-2 mx-auto justify-center md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5  gap-4">
            {
                cursos.map(curso => <CursoCard key={curso.id} curso={curso} />)
            }
        </div>
    )
}
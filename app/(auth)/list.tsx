'use client';

import { useCursos } from "@/hooks/use-cursos";
import { CursoCard } from "./(componentes)/curso-card";
import { inscripciones } from "@/prisma/generated";

interface Props {
    inscripciones: inscripciones[]
}

export default function ListarCursos({ inscripciones }: Props) {
    const { cursos } = useCursos({
        limit: 20,
        sortBy: 'creadoEn',
        sortOrder: 'desc',

    });
    return (
        <div className="grid grid-cols-1 px-10 sm:px-0 sm:grid-cols-2 mx-auto justify-center md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5  gap-4">
            {
                cursos.filter(value => inscripciones.every(value2 => value2.edicionId != value.ediciones.at(0)?.id)).map(curso => <CursoCard key={curso.id} curso={curso} />)
            }
        </div>
    )
}
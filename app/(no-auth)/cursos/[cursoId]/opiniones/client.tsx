'use client';

import { beneficiosCursos, clases, cursos, docente, edicionesCursos, objetivosCursos, preciosCursos, requisitosCursos, reviewsCursos, usuariosEstudiantes } from "@/prisma/generated";
interface Props {
    reviews: Array<reviewsCursos & { curso: cursos }>
}
export default function ReviewsClient({ reviews }: Props) {

    return (
        <div className="space-y-6  pt-10  px-5">



        </div>
    );
}
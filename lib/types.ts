import { categorias, categoriasCursos, cursos, docente, edicionesCursos, preciosCursos, reviewsCursos, usuariosEstudiantes } from "@/prisma/generated"

interface Curso extends cursos {
    ediciones: Array<edicionesCursos & {
        precios: preciosCursos[], docente: docente
    }>;
    categorias: (categoriasCursos & { categoria: categorias })[]
    reviews: Array<reviewsCursos & { usuario: usuariosEstudiantes }>;
}



export type { Curso };
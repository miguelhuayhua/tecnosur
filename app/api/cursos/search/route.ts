// app/api/cursos/search/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('q') || searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || '5');

        // Validación mínima
        if (!search || search.trim().length < 2) {
            return Response.json({ cursos: [] });
        }

        // Consulta OPTIMIZADA - Solo los campos necesarios para el preview
        const cursos = await prisma.cursos.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { titulo: { contains: search, mode: 'insensitive' } },
                            { descripcion: { contains: search, mode: 'insensitive' } },
                            { descripcionCorta: { contains: search, mode: 'insensitive' } }
                        ]
                    },
                    {
                        ediciones: {
                            some: {
                                estado: 'ACTIVA'
                            }
                        }
                    }
                ]
            },
            // SOLO los campos que necesitas mostrar en el popover
            select: {
                id: true,
                titulo: true,
                descripcion: true,
                urlMiniatura: true, // ✅ Campo correcto del schema
                enVivo: true, // Para mostrar si es en vivo o grabado
                ediciones: {
                    where: {
                        estado: 'ACTIVA'
                    },
                    select: {
                        id: true,
                        codigo: true,
                        fechaInicio: true,
                        fechaFin: true,
                        precios: {
                            where: {
                                esPrecioDefault: true
                            },
                            select: {
                                precio: true,
                                moneda: true
                            },
                            take: 1
                        }
                    },
                    orderBy: {
                        fechaInicio: 'asc'
                    },
                    take: 1
                }
            },
            orderBy: {
                creadoEn: 'desc'
            },
            take: limit
        });

        // Filtrar cursos que realmente tengan ediciones
        const cursosConEdiciones = cursos.filter(curso =>
            curso.ediciones && curso.ediciones.length > 0
        );

        return Response.json({ cursos: cursosConEdiciones });

    } catch (error) {
        console.error('Error searching cursos:', error);
        return Response.json(
            { error: 'Error en la búsqueda' },
            { status: 500 }
        );
    }
}

export { GET };
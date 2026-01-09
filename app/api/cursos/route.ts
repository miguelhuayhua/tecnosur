"/api/cursos/route.s"
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const GET = async (req: NextRequest) => {
    try {
        // Obtener parámetros de query
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const categoria = searchParams.get('categoria') || '';
        const precioMin = searchParams.get('precioMin');
        const precioMax = searchParams.get('precioMax');
        const descuento = searchParams.get('descuento');
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFin = searchParams.get('fechaFin');
        const enVivo = searchParams.get('enVivo'); // Nuevo: 'true' o 'false'
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const sortBy = searchParams.get('sortBy') || 'creadoEn';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const skip = (page - 1) * limit;

        // Construir where clause
        const where: any = {
            AND: [],
        };

        // Filtro de búsqueda por texto
        if (search) {
            where.AND.push({
                OR: [
                    { titulo: { contains: search, mode: 'insensitive' } },
                    { descripcion: { contains: search, mode: 'insensitive' } },
                    { descripcionCorta: { contains: search, mode: 'insensitive' } }
                ]
            });
        }

        // Filtro por categoría
        if (categoria) {
            where.AND.push({
                categorias: {
                    some: {
                        categoria: {
                            id: categoria
                        }
                    }
                }
            });
        }

        // Filtro por cursos en vivo/grabados
        if (enVivo) {
            const enVivoBoolean = enVivo === 'true';
            where.AND.push({
                enVivo: enVivoBoolean
            });
        }

        if (descuento) {
            const descuentoBoolean = descuento === 'true';
            where.AND.push({
                ediciones: {
                    some: {
                        precios: {
                            some: {
                                esDescuento: descuentoBoolean
                            }
                        }
                    }
                }
            });
        }

        // Filtro por rango de precios
        if (precioMin || precioMax) {
            where.AND.push({
                ediciones: {
                    some: {
                        precios: {
                            some: {
                                AND: [
                                    precioMin ? { precio: { gte: parseFloat(precioMin) } } : {},
                                    precioMax ? { precio: { lte: parseFloat(precioMax) } } : {},
                                    { esPrecioDefault: true }
                                ]
                            }
                        }
                    }
                }
            });
        }

        // Filtro por rango de fechas
        if (fechaInicio || fechaFin) {
            const fechaFilter: any = {};
            if (fechaInicio) fechaFilter.gte = new Date(fechaInicio);
            if (fechaFin) fechaFilter.lte = new Date(fechaFin);

            where.AND.push({
                ediciones: {
                    some: {
                        OR: [
                            { fechaInicio: fechaFilter },
                            { fechaFin: fechaFilter }
                        ]
                    }
                }
            });
        }

        // IMPORTANTE: Solo cursos con al menos una edición
        where.ediciones = {
            some: {}  // Esto asegura que haya al menos una edición
        };

        // Limpiar AND si está vacío
        if (where.AND.length === 0) {
            delete where.AND;
        }

        // Ordenamiento
        const orderBy: any = {};
        const validSortFields = {
            'creadoEn': 'creadoEn',
            'titulo': 'titulo',
            'actualizadoEn': 'actualizadoEn',
        };
        const validSortField = validSortFields[sortBy as keyof typeof validSortFields] || 'creadoEn';
        orderBy[validSortField] = sortOrder;

        // CONSULTA PRINCIPAL - Devuelve los datos tal cual de la BD
        const [cursos, total] = await Promise.all([
            prisma.cursos.findMany({
                where: where,
                include: {
                    ediciones: {
                        where: {
                            estado: {
                                in: ['ACTIVA']
                            }
                        },
                        include: {
                            clases: {
                                where: {
                                    orden: { equals: 1 }
                                },
                                take: 1
                            },
                            precios: {
                                where: {
                                    OR: [
                                        { esPrecioDefault: true },
                                        { esDescuento: true }
                                    ]
                                },
                                orderBy: { esPrecioDefault: 'desc' }
                            },
                            _count: { select: { clases: true } }
                        },
                        orderBy: {
                            fechaInicio: 'asc'
                        },
                        take: 1
                    },
                    categorias: {
                        include: {
                            categoria: true
                        }
                    },

                    objetivos: true,
                    reviews: {
                        select: {
                            id: true,
                            rating: true,
                            comentario: true,
                            creadoEn: true,
                            usuario: {
                                select: {
                                    correo: true,
                                    avatar: true,
                                    id: true,

                                }
                            }
                        },
                        orderBy: {
                            creadoEn: 'desc'
                        },
                        take: 3
                    },
                },
                orderBy,
                skip,
                take: limit
            }),
            prisma.cursos.count({ where })
        ]);

        // Filtrar cursos que realmente tengan ediciones
        const cursosConEdiciones = cursos.filter(curso =>
            curso.ediciones && curso.ediciones.length > 0
        );

        return Response.json({
            cursos: cursosConEdiciones,
            pagination: {
                page,
                limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching cursos:', error);
        return Response.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export { GET };
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CalificacionesClient } from "./calificaciones-client";

// Función para normalizar notas entre diferentes escalas
const normalizarNota = (
    nota: number,
    notaMinimaExamen: number,
    notaMaximaExamen: number,
    notaMinimaEdicion: number,
    notaMaximaEdicion: number
) => {
    // Normalizar a porcentaje (0-1)
    const porcentaje = (nota - notaMinimaExamen) / (notaMaximaExamen - notaMinimaExamen);

    // Escalar a la escala de la edición
    const notaNormalizada = porcentaje * (notaMaximaEdicion - notaMinimaEdicion) + notaMinimaEdicion;

    return Math.max(notaMinimaEdicion, Math.min(notaMaximaEdicion, notaNormalizada));
};

async function getCalificacionesCurso(edicionId: string, correo: string) {
    try {
        const inscripcion = await prisma.inscripciones.findFirst({
            where: {
                edicionId,
                estudiante: {
                    usuario: { correo }
                },
                estaActivo: true
            },
            include: {
                edicion: {
                    include: {
                        curso: {
                            select: {
                                titulo: true,
                                descripcion: true
                            }
                        },
                        examenes: {
                            include: {
                                calificaciones: {
                                    where: {
                                        estudiante: {
                                            usuario: { correo }
                                        }
                                    },
                                    take: 1
                                }
                            },
                            orderBy: {
                                fechaDisponible: 'asc'
                            }
                        }
                    }
                }
            }
        });

        if (!inscripcion) {
            return null;
        }

        // Procesar calificaciones con normalización
        const examenesConCalificaciones = inscripcion.edicion.examenes.map(examen => {
            const calificacion = examen.calificaciones[0];
            let notaNormalizada = null;
            let aprobado = false;

            if (calificacion) {
                notaNormalizada = normalizarNota(
                    calificacion.nota,
                    examen.notaMinima,
                    examen.notaMaxima,
                    inscripcion.edicion.notaMinima,
                    inscripcion.edicion.notaMaxima
                );
                aprobado = notaNormalizada >= inscripcion.edicion.notaMinima;
            }

            return {
                examen,
                calificacion,
                notaNormalizada,
                aprobado
            };
        });

        // Calcular estadísticas con notas normalizadas
        const calificacionesNormalizadas = examenesConCalificaciones
            .filter(item => item.notaNormalizada !== null)
            .map(item => item.notaNormalizada!);

        const promedio = calificacionesNormalizadas.length > 0
            ? calificacionesNormalizadas.reduce((a, b) => a + b, 0) / calificacionesNormalizadas.length
            : 0;

        const aprobados = examenesConCalificaciones.filter(item => item.aprobado).length;
        const reprobados = examenesConCalificaciones.filter(item =>
            item.notaNormalizada !== null && !item.aprobado
        ).length;

        return {
            curso: {
                titulo: inscripcion.edicion.curso.titulo,
                descripcion: inscripcion.edicion.curso.descripcion,
                edicionCodigo: inscripcion.edicion.codigo
            },
            configuracionEdicion: {
                notaMinima: inscripcion.edicion.notaMinima,
                notaMaxima: inscripcion.edicion.notaMaxima
            },
            examenes: inscripcion.edicion.examenes.map((examen, index) => ({
                id: examen.id_,
                titulo: examen.titulo,
                descripcion: examen.descripcion,
                fechaDisponible: examen.fechaDisponible,
                fechaLimite: examen.fechaLimite,
                notaMaxima: examen.notaMaxima,
                notaMinima: examen.notaMinima,
                calificacion: examen.calificaciones[0] ? {
                    id: examen.calificaciones[0].id_,
                    nota: examen.calificaciones[0].nota,
                    notaNormalizada: examenesConCalificaciones[index].notaNormalizada,
                    aprobado: examenesConCalificaciones[index].aprobado,
                    fechaPresentado: examen.calificaciones[0].fechaPresentado,
                    comentarios: examen.calificaciones[0].comentarios || undefined
                } : null
            })),
            estadisticas: {
                totalExamenes: inscripcion.edicion.examenes.length,
                totalCalificados: calificacionesNormalizadas.length,
                promedio: promedio,
                aprobados: aprobados,
                reprobados: reprobados,
                porcentajeAprobacion: calificacionesNormalizadas.length > 0 ?
                    (aprobados / calificacionesNormalizadas.length) * 100 : 0,
                notaMinimaEdicion: inscripcion.edicion.notaMinima,
                notaMaximaEdicion: inscripcion.edicion.notaMaxima
            }
        };
    } catch (error) {
        console.error('Error fetching calificaciones:', error);
        return null;
    }
}

export default async function CalificacionesPage({ params }: { params: { id: string } }) {
    const session = await getServerSession();

    if (!session?.user) {
        return <div>No autenticado</div>;
    }

    const data = await getCalificacionesCurso(params.id, session.user.email!);

    if (!data) {
        return (
            <ContentLayout title="Calificaciones No Disponibles">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-muted-foreground">
                        No tienes acceso a estas calificaciones
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        O la edición no existe o no estás inscrito en este curso.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/cursos">
                            Volver a mis cursos
                        </Link>
                    </Button>
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title={`Calificaciones - ${data.curso.titulo}`}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/cursos">Mis Cursos</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Calificaciones</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>


            {/* Componente Client */}
            <CalificacionesClient data={data as any} edicionId={params.id} />
        </ContentLayout>
    );
}
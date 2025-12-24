import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma";
import { CalendarClient } from "./calendar-client";
import { Clase, Examen } from "@/types/calendario";
import { ContentLayout } from "@/components/dashboard/content-layout";

// Función para obtener las clases y exámenes del estudiante
async function getCalendarioEstudiante(correo: string) {
    try {

        // Buscar al estudiante por su correo de usuario
        const estudiante = await prisma.estudiantes.findFirst({
            where: {
                usuario: {
                    correo: correo
                }
            },
            include: {
                inscripciones: {
                    where: {
                        estado: true
                    },
                    include: {
                        edicion: {
                            select: {
                                vigente: true,
                                fechaFin: true,
                                fechaInicio: true,
                                codigo: true,
                                id: true,
                                curso: true,
                                estado: true,
                                descripcion: true,
                                clases: {
                                    orderBy: { fecha: 'asc' },

                                },
                                examenes: {
                                    orderBy: { fechaDisponible: 'asc' },
                                    where: {
                                        OR: [
                                            { fechaDisponible: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1) } },
                                            { fechaLimite: { gte: new Date() } }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!estudiante) {
            return { clases: [], examenes: [] };
        }
        const edicion = estudiante.inscripciones.find(val => val.edicion.vigente)?.edicion;
        // En /app/dashboard/calendario/page.tsx - actualiza la parte de procesar clases
        // Procesar las clases con horas fijas de la edición
        const clases: Clase[] = estudiante.inscripciones.flatMap(inscripcion =>
            inscripcion.edicion.clases.map(clase => {
                // Crear fecha con la hora fija de las ediciones (por ejemplo, 08:00 - 10:00)
                const fechaClase = new Date(clase.fecha);

                // Establecer hora fija para inicio (ej: 08:00 AM)
                const startDate = new Date(fechaClase);

                // Verificar si la edición tiene fechaInicio válida
                const horaInicio = edicion?.fechaInicio?.getHours() ?? 8; // Hora por defecto 08:00 AM
                const minutoInicio = edicion?.fechaInicio?.getMinutes() ?? 0;
                startDate.setHours(horaInicio, minutoInicio, 0, 0);

                // Establecer hora fija para fin (ej: 10:00 AM)
                const endDate = new Date(fechaClase);

                // Verificar si la edición tiene fechaFin válida
                const horaFin = edicion?.fechaFin?.getHours() ?? 10; // Hora por defecto 10:00 AM
                const minutoFin = edicion?.fechaFin?.getMinutes() ?? 0;
                endDate.setHours(horaFin, minutoFin, 0, 0);

                // Si la clase tiene duración, calcular endDate basado en startDate + duración
                if (clase.duracion) {
                    endDate.setTime(startDate.getTime() + (clase.duracion * 60000));
                }

                // Validar que las fechas sean válidas antes de usar toISOString()
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    console.error('❌ Fecha inválida para clase:', clase.id, clase.titulo);
                    return null; // Omitir esta clase si tiene fechas inválidas
                }

                return {
                    id: clase.id,
                    titulo: clase.titulo,
                    descripcion: clase.descripcion || '',
                    fecha: clase.fecha.toISOString(),
                    duracion: clase.duracion || 120, // Duración por defecto 2 horas
                    urlYoutube: clase.urlYoutube || '',
                    edicion: {
                        id: inscripcion.edicion.id,
                        codigo: inscripcion.edicion.codigo,
                        curso: {
                            id: inscripcion.edicion.curso.id,
                            titulo: inscripcion.edicion.curso.titulo,
                            descripcion: inscripcion.edicion.curso.descripcion || ''
                        },
                        descripcion: inscripcion.edicion.descripcion || '',
                        estado: inscripcion.edicion.estado
                    },
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    type: 'clase' as const,
                    color: 'blue' as const
                };
            })
        ).filter(Boolean) as Clase[]; // Filtrar las clases nulas
        // Procesar los exámenes
        const examenes: Examen[] = estudiante.inscripciones.flatMap(inscripcion =>
            inscripcion.edicion.examenes.map(examen => ({
                id: examen.id,
                titulo: examen.titulo,
                descripcion: examen.descripcion || '',
                fechaDisponible: examen.fechaDisponible.toISOString(),
                fechaLimite: examen.fechaLimite.toISOString(),
                notaMaxima: examen.notaMaxima,
                notaMinima: examen.notaMinima,
                edicion: {
                    id: inscripcion.edicion.id,
                    codigo: inscripcion.edicion.codigo,
                    curso: {
                        id: inscripcion.edicion.curso.id,
                        titulo: inscripcion.edicion.curso.titulo,
                        descripcion: inscripcion.edicion.curso.descripcion || ''
                    },
                    descripcion: inscripcion.edicion.descripcion || '',
                    estado: inscripcion.edicion.estado
                },
                startDate: examen.fechaDisponible.toISOString(),
                endDate: examen.fechaLimite.toISOString(),
                type: 'examen' as const,
                color: 'red' as const
            }))
        );


        return { clases, examenes };

    } catch (error) {
        console.error('❌ Error fetching calendario estudiante:', error);
        return { clases: [], examenes: [] };
    }
}

export default async function CalendarioPage() {
    const session = await getServerSession();

    if (!session?.user?.email) {
        notFound();
    }

    const { clases, examenes } = await getCalendarioEstudiante(session.user.email);

    return (
        <ContentLayout title="Mi Calendario">
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
                        <BreadcrumbPage>Calendario</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-6">
                <CalendarClient clases={clases as any} examenes={examenes as any} />
            </div>
        </ContentLayout>
    );
}
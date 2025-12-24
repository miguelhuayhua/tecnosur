import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { ExamenesTable } from "./examenes-table";
import { ContentLayout } from "@/components/dashboard/content-layout";

async function getTodosLosExamenes(correo: string) {
    try {
        const inscripciones = await prisma.inscripciones.findMany({
            where: {
                estudiante: {
                    usuario: { correo }
                },
                estado: true
            },
            include: {
                edicion: {
                    include: {
                        curso: {
                            select: {
                                id: true,
                                titulo: true
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

        // Aplanar todos los exámenes de todas las ediciones
        const todosExamenes = inscripciones.flatMap(inscripcion =>
            inscripcion.edicion.examenes.map(examen => ({
                id: examen.id,
                titulo: examen.titulo,
                descripcion: examen.descripcion,
                fechaDisponible: examen.fechaDisponible,
                fechaLimite: examen.fechaLimite,
                notaMaxima: examen.notaMaxima,
                notaMinima: examen.notaMinima,
                calificacion: examen.calificaciones[0] || null,
                curso: {
                    id: inscripcion.edicion.curso.id,
                    titulo: inscripcion.edicion.curso.titulo
                },
                edicionId: inscripcion.edicionId
            }))
        );

        // Ordenar por fecha disponible (próximos primero)
        return todosExamenes.sort((a, b) => 
            new Date(a.fechaDisponible).getTime() - new Date(b.fechaDisponible).getTime()
        );
    } catch (error) {
        console.error('Error fetching todos los examenes:', error);
        return [];
    }
}

export default async function TodosLosExamenesPage() {
    const session = await getServerSession();

    if (!session?.user?.email) {
        return <div>No autenticado</div>;
    }

    const examenes = await getTodosLosExamenes(session.user.email);

    return (
        <ContentLayout title="Exámenes">
            <ExamenesTable examenes={examenes as any} />
        </ContentLayout>
    );
}
import Link from "next/link";
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
import { CalificacionesClient } from "./calificaciones-client";
import { ContentLayout } from "@/components/dashboard/content-layout";
import { notFound } from "next/navigation";

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
    const inscripcion = await prisma.inscripciones.findFirst({
        where: {
            edicion: { id: edicionId },
            estudiante: {
                usuario: { correo }
            },
        },
        include: {
            edicion: {
                include: {
                    curso: {
                        select: {
                            titulo: true,
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

    if (!inscripcion) return notFound();
    return inscripcion;
}

export default async function CalificacionesPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const p = await params;
    if (!session) return notFound();

    const inscripcion = await getCalificacionesCurso(p.id, session.user?.email!);


    return (
        <ContentLayout title={`Calificaciones - ${inscripcion.edicion.curso.titulo}`}>
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
                        <BreadcrumbLink asChild>
                            <Link href={`/dashboard/cursos/${inscripcion.edicionId}`}>{
                                inscripcion.edicion.curso.titulo
                            }</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Calificaciones</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>


            {/* Componente Client */}
            <CalificacionesClient inscripcion={inscripcion} />
        </ContentLayout>
    );
}
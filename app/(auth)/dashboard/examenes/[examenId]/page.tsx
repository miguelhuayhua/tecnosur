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
import { Button } from "@/components/ui/button";
import { ExamenDetail } from "./examen-detail";
import { ContentLayout } from "@/components/dashboard/content-layout";

async function getExamenDetalle(examenId: string, correo: string) {
    try {
        const examen = await prisma.examenes.findFirst({
            where: {
                id_: examenId,
                edicion: {
                    inscripciones: {
                        some: {
                            estudiante: {
                                usuario: { correo }
                            },
                            estado: true
                        }
                    }
                }
            },
            include: {
                edicion: {
                    include: {
                        curso: {
                            select: {
                                id: true,
                                titulo: true,
                                descripcion: true,
                                urlMiniatura: true
                            }
                        }
                    }
                },
                calificaciones: {
                    where: {
                        estudiante: {
                            usuario: { correo }
                        }
                    },
                    take: 1
                }
            }
        });

        if (!examen) {
            return null;
        }

        return {
            id: examen.id,
            titulo: examen.titulo,
            descripcion: examen.descripcion,
            fechaDisponible: examen.fechaDisponible,
            fechaLimite: examen.fechaLimite,
            notaMaxima: examen.notaMaxima,
            notaMinima: examen.notaMinima,
            calificacion: examen.calificaciones[0] || null,
            curso: {
                id: examen.edicion.curso.id,
                titulo: examen.edicion.curso.titulo,
                descripcion: examen.edicion.curso.descripcion,
                urlMiniatura: examen.edicion.curso.urlMiniatura,
                edicionId: examen.edicionId
            }
        };
    } catch (error) {
        console.error('Error fetching examen detalle:', error);
        return null;
    }
}

export default async function ExamenDetailPage({ params }: { params: { examenId: string } }) {
    const session = await getServerSession();

    if (!session?.user) {
        return <div>No autenticado</div>;
    }

    const examen = await getExamenDetalle(params.examenId, session.user.email!);

    if (!examen) {
        return (
            <ContentLayout title="Examen No Encontrado">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-muted-foreground">
                        Examen no encontrado
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        El examen no existe o no tienes acceso a él.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/examenes">
                            Volver a mis exámenes
                        </Link>
                    </Button>
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title={`Examen - ${examen.titulo}`}>
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
                            <Link href="/dashboard/examenes">Mis Exámenes</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{examen.titulo}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <ExamenDetail examen={examen as any} />
        </ContentLayout>
    );
}
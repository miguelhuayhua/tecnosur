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
import { CertificadoDetail } from "./certificado-detail";

async function getCertificadoDetalle(certificadoId: string, correo: string) {
    try {
        const certificado = await prisma.certificados.findFirst({
            where: {
                id_: certificadoId,
                estudiante: {
                    usuario: { correo }
                }
            },
            include: {
                estudiante: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true,
                                correo: true
                            }
                        }
                    }
                },
                edicion: {
                    select: {
                        codigo: true,
                        fechaInicio: true,
                        fechaFin: true,
                        notaMinima: true,  // ✅ AGREGADO
                        notaMaxima: true,  // ✅ AGREGADO
                        curso: {
                            select: {
                                id_: true,
                                titulo: true,
                                descripcion: true,
                                urlMiniatura: true
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

        if (!certificado) {
            return null;
        }

        return {
            id: certificado.id_,
            codigoUnico: certificado.codigoUnico,
            fechaEmision: certificado.fechaEmision,
            notaFinal: certificado.notaFinal,
            urlCertificado: certificado.urlCertificado,
            estudiante: {
                nombre: certificado.estudiante.usuario.nombre,
                correo: certificado.estudiante.usuario.correo
            },
            curso: {
                id: certificado.edicion.curso.id_,
                titulo: certificado.edicion.curso.titulo,
                descripcion: certificado.edicion.curso.descripcion,
                urlMiniatura: certificado.edicion.curso.urlMiniatura,
                edicionId: certificado.edicionId
            },
            edicion: {
                codigo: certificado.edicion.codigo,
                fechaInicio: certificado.edicion.fechaInicio,
                fechaFin: certificado.edicion.fechaFin,
                notaMinima: certificado.edicion.notaMinima,  // ✅ AGREGADO
                notaMaxima: certificado.edicion.notaMaxima   // ✅ AGREGADO
            },
            examenes: certificado.edicion.examenes.map(examen => ({
                id: examen.id_,
                titulo: examen.titulo,
                notaMaxima: examen.notaMaxima,
                notaMinima: examen.notaMinima,
                calificacion: examen.calificaciones[0] || null
            }))
        };
    } catch (error) {
        console.error('Error fetching certificado detalle:', error);
        return null;
    }
}

export default async function CertificadoDetailPage({ params }: { params: { certificadoId: string } }) {
    const session = await getServerSession();

    if (!session?.user) {
        return <div>No autenticado</div>;
    }

    const certificado = await getCertificadoDetalle(params.certificadoId, session.user.email!);

    if (!certificado) {
        return (
            <ContentLayout title="Certificado No Encontrado">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-muted-foreground">
                        Certificado no encontrado
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        El certificado no existe o no tienes acceso a él.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/certificados">
                            Volver a mis certificados
                        </Link>
                    </Button>
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title={`Certificado - ${certificado.codigoUnico}`}>
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
                            <Link href="/dashboard/certificados">Mis Certificados</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{certificado.codigoUnico}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <CertificadoDetail certificado={certificado as any} />
        </ContentLayout>
    );
}
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
import { CertificadosGrid } from "./certificados-grid";
import { notFound } from "next/navigation";

async function getCertificadosEstudiante(correo: string) {
    try {
        const certificados = await prisma.certificados.findMany({
            where: {
                estudiante: {
                    usuario: { correo }
                }
            },
            include: {
                edicion: {
                    include: {
                        curso: {
                            select: {
                                id_: true,
                                titulo: true,
                                descripcion: true,
                                urlMiniatura: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                fechaEmision: 'desc'
            }
        });

        return certificados.map(certificado => ({
            id: certificado.id_,
            codigoUnico: certificado.codigoUnico,
            fechaEmision: certificado.fechaEmision,
            notaFinal: certificado.notaFinal,
            urlCertificado: certificado.urlCertificado,
            curso: {
                id: certificado.edicion.curso.id_,
                titulo: certificado.edicion.curso.titulo,
                descripcion: certificado.edicion.curso.descripcion,
                urlMiniatura: certificado.edicion.curso.urlMiniatura
            },
            edicion: {
                codigo: certificado.edicion.codigo,
                fechaInicio: certificado.edicion.fechaInicio,
                fechaFin: certificado.edicion.fechaFin,
                notaMinima: certificado.edicion.notaMinima // Agregado aquí
            }
        }));
    } catch (error) {
        console.error('Error fetching certificados:', error);
        return [];
    }
}

export default async function CertificadosPage() {
    const session = await getServerSession();

    if (!session?.user) return notFound();

    const certificados = await getCertificadosEstudiante(session.user.email!);

    return (
        <ContentLayout title="Mis Certificados">
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
                        <BreadcrumbPage>Mis Certificados</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <CertificadosGrid certificados={certificados as any} />
        </ContentLayout>
    );
}
import Link from "next/link";
import { ContentLayout } from "@/components/dashboard/content-layout";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma";
import { CursosGrid } from "./cursos-grid";
import { getServerSession } from "next-auth";

async function getCursosInscritos(correo: string) {
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
                            include: {
                                categorias: {
                                    include: {
                                        categoria: true
                                    }
                                }
                            }
                        },
                        clases: {
                            orderBy: {
                                orden: 'asc'
                            }
                        }
                    }
                }
            },
            orderBy: {
                inscritoEn: 'desc'
            }
        });

        return inscripciones;
    } catch (error) {
        console.error('Error fetching cursos inscritos:', error);
        return [];
    }
}

export default async function MisCursosPage() {
    const session = await getServerSession();

    if (!session?.user) {
        return <div>No autenticado</div>;
    }

    const cursos = await getCursosInscritos(session.user.email!);

    return (
        <ContentLayout title="Mis Cursos">
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
                        <BreadcrumbPage>Mis Cursos</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <CursosGrid inscripciones={cursos} />
        </ContentLayout>
    );
}
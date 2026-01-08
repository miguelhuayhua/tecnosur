import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma";
import CursoEstudianteDetalle from "./curso-detalle";
import { ContentLayout } from "@/components/dashboard/content-layout";
import { getServerSession } from "next-auth";


async function getEdicionCurso(id: string, correo: string) {
    const edicion = await prisma.edicionesCursos.findUnique({
        where: { id },
        include: {
            curso: {
                include: {
                    categorias: {
                        include: {
                            categoria: true
                        }
                    },
                    reviews: {
                        where: {
                            usuario: {
                                correo
                            }
                        }
                    }
                }
            },
            clases: {
                orderBy: { orden: 'asc' },
                include: {
                    materiales: true
                }
            },
            examenes: {
                orderBy: { creadoEn: 'asc' }
            },
            inscripciones: {
                include: {
                    estudiante: true
                }
            },
            precios: {
                orderBy: { esPrecioDefault: 'desc' }
            },

        }
    });

    if (!edicion) return notFound();
    return { edicion };

}

export default async function CursoDetailPage({ params }: any) {
    const param = await params;
    const session = await getServerSession();
    const { edicion } = await getEdicionCurso(param.id, session?.user.email!);


    if (!edicion) {
        notFound();
    }

    return (
        <ContentLayout title={`${edicion.curso.titulo} - ${edicion.codigo}`}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        Dashboard
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/cursos">Mis Cursos</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{edicion.curso.titulo}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <CursoEstudianteDetalle edicion={edicion}  />
        </ContentLayout>
    );
}
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
import { getSession } from "next-auth/react";


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
                    beneficios: {
                        orderBy: { orden: 'asc' }
                    },
                    objetivos: {
                        orderBy: { orden: 'asc' }
                    },
                    requisitos: {
                        orderBy: { orden: 'asc' }
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
            }
        }
    });
    const miReview = await prisma.reviewsCursos.count({ where: { curso: { ediciones: { every: { id } } }, usuario: { correo } } })
    if (!edicion) return notFound();

    return { edicion, miReview };

}

export default async function CursoDetailPage({ params }: any) {
    const param = await params;
    const session = await getSession();
    const { edicion, miReview } = await getEdicionCurso(param.id, session?.user.email!);


    if (!edicion) {
        notFound();
    }

    return (
        <ContentLayout title={`Curso: ${edicion.curso.titulo} - ${edicion.codigo}`}>
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
                        <BreadcrumbPage>{edicion.curso.titulo}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <CursoEstudianteDetalle edicion={edicion} miReview={miReview} />
        </ContentLayout>
    );
}
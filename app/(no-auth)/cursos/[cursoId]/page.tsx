// app/cursos/[cursoId]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CursoDetailClient from './client';
import { Navbar } from '../../static/navbar';
import { Footer } from '../../static/footer';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ cursoId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const { cursoId } = resolvedParams;

        const curso = await prisma.cursos.findFirst({
            where: { OR: [{ id: cursoId }, { urlCurso: cursoId }] },
        });

        if (!curso) {
            return {
                title: 'Curso no encontrado',
            };
        }

        return {
            title: `${curso.titulo} - TecSur Perú`,
            description: curso.descripcion,
            openGraph: {
                title: curso.titulo,
                description: curso.descripcion,
                images: curso.urlMiniatura ? [curso.urlMiniatura] : [],
                type: 'website',
            },
        };
    } catch (error) {
        return {
            title: 'Error',
        };
    }
}

export default async function CursoDetailPage({ params }: PageProps) {
    // CORRECCIÓN: await params directamente en lugar de usar use()
    const resolvedParams = await params;
    const { cursoId } = resolvedParams;
    const curso = await prisma.cursos.findFirst({
        where: { OR: [{ id: cursoId }, { urlCurso: cursoId }] },
        include: {
            // Incluir ediciones con sus precios y clases
            ediciones: {
                where: {
                    estado: {
                        in: ['ACTIVA'],
                    },
                    vigente: true
                },
                include: {
                    compras: {
                        select: {
                            usuariosEstudiantesId: true
                        }
                    },
                    precios: {
                        where: { esPrecioDefault: true },
                    },
                    clases: {
                        orderBy: { orden: 'asc' }
                    },
                    docente: true
                },
                orderBy: { fechaInicio: 'asc' }
            },
            categorias: {
                include: {
                    categoria: true
                }
            },
            objetivos: {
                orderBy: { orden: 'asc' }
            },
            beneficios: {
                orderBy: { orden: 'asc' }
            },
            requisitos: {
                orderBy: { orden: 'asc' }
            },
            reviews: {
                include: {
                    usuario: {
                        select: { estudiante: true, usuario: true, avatar: true }
                    }
                },
                orderBy: { creadoEn: 'desc' }
            }
        },
    });

    if (!curso) {
        notFound();
    }

    return (
        <>
            <Navbar />
            <CursoDetailClient curso={curso} />
            <Footer />
        </>
    );

}
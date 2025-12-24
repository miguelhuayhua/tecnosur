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

    try {
        const curso = await prisma.cursos.findFirst({
            where: { OR: [{ id: cursoId }, { urlCurso: cursoId }] },
            include: {
                // Incluir ediciones con sus precios y clases
                ediciones: {
                    where: {
                        estado: {
                            in: ['ACTIVA']
                        }
                    },
                    include: {
                        precios: {
                            where: {
                                OR: [
                                    { esPrecioDefault: true },
                                    { esDescuento: true }
                                ]
                            },
                            orderBy: { esPrecioDefault: 'desc' }
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
                        usuario: true
                    },
                    orderBy: { creadoEn: 'desc' }
                }
            },
        });

        if (!curso) {
            notFound();
        }

       
        console.log('Curso cargado:', curso.id);

        return (
            <>
                <Navbar />
                <CursoDetailClient curso={curso as any} />
                <Footer />
            </>
        );
    } catch (error) {
        console.error('Error fetching curso:', error);
        notFound();
    }
}
// app/cursos/[cursoId]/reviews/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { Navbar } from '@/app/(no-auth)/static/navbar';
import CursoReviewsClient from './client';
import { Footer } from '@/app/(no-auth)/static/footer';

interface PageProps {
    params: Promise<{ cursoId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
        title: `Reseñas - ${curso.titulo} | Nexus Educa`,
        description: `Opiniones y reseñas de estudiantes sobre el curso ${curso.titulo}`,
        openGraph: {
            title: `Reseñas - ${curso.titulo}`,
            description: `Opiniones y reseñas de estudiantes sobre el curso ${curso.titulo}`,
            images: curso.urlMiniatura ? [curso.urlMiniatura] : [],
            type: 'website',
        },
    };
}

export default async function CursoReviewsPage({ params }: PageProps) {
    const resolvedParams = await params;
    const { cursoId } = resolvedParams;

    // Obtener el curso con TODAS las reviews
    const curso = await prisma.cursos.findFirst({
        where: { OR: [{ id: cursoId }, { urlCurso: cursoId }] },
        include: {
            // Solo información básica del curso
            categorias: {
                select: {
                    categoria: true
                }
            },
            // TODAS las reviews con información del estudiante
            reviews: {
                include: {
                    usuario: {
                        select: { 
                            estudiante: {
                                select: {
                                    nombre: true,
                                    apellido: true,
                                    pais: true
                                }
                            },
                            avatar:true,
                            usuario:true,
                            
                        }
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
            <CursoReviewsClient 
                curso={curso}
            />
            <Footer />
        </>
    );
}
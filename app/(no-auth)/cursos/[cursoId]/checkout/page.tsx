import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CheckoutClient from './client';
import { getServerSession } from 'next-auth';
import { Navbar } from '@/app/(no-auth)/static/navbar';
import { Footer } from '@/app/(no-auth)/static/footer';

interface PageProps {
    params: Promise<{ cursoId: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
    const { cursoId } = await params;
    const session = await getServerSession();

    try {
        // Obtener el curso con todas sus relaciones necesarias
        const curso = await prisma.cursos.findUnique({
            where: { id: cursoId },
            include: {
                beneficios: true,
                categorias: {
                    include: {
                        categoria: true
                    }
                },
                objetivos: true,
                requisitos: true,
                ediciones: {
                    include: {
                        precios: {
                            where: {
                                OR: [
                                    { esPrecioDefault: true },
                                    { esDescuento: true },
                                ],
                            },
                            orderBy: { esPrecioDefault: 'desc' },
                        },
                    },
                    where: {
                        OR: [
                            { estado: 'ACTIVA' },
                            { vigente: true },
                        ],
                    },
                    orderBy: [
                        { vigente: 'desc' },
                        { fechaInicio: 'desc' },
                    ],
                },
            },
        });

        if (!curso) {
            notFound();
        }

        // Encontrar la edición activa para mostrar
        const edicionActiva = curso.ediciones.find(ed =>
            ed.estado === 'ACTIVA' || ed.vigente === true
        ) || curso.ediciones[0];

        if (!edicionActiva) {
            notFound();
        }

        // Verificar que haya precios disponibles
        if (!edicionActiva.precios || edicionActiva.precios.length === 0) {
            notFound();
        }

        return (
            <>
                <Navbar />
                <CheckoutClient
                    curso={{
                        ...curso,
                        categorias: curso.categorias.map(cc => ({
                            categoria: cc.categoria,
                        })),
                        beneficios: curso.beneficios,
                        objetivos: curso.objetivos,
                        requisitos: curso.requisitos,
                        ediciones: [{
                            ...edicionActiva,
                            precios: edicionActiva.precios,
                        }],
                    }}
                    session={session}
                />
                <Footer />
            </>
        );
    } catch (error) {
        console.error('Error loading checkout page:', error);
        notFound();
    }
}
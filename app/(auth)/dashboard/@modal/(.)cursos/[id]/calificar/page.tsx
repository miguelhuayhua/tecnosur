import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CalificarCursoModal from './client';
export default async function CalificarCurso({ params }: any) {
    const { id } = await params;

    try {
        // Obtener paciente con todos los datos
        const edicion = await prisma.edicionesCursos.findUnique({
            where: { id },
            include: {
                curso: {
                    include: { reviews: true }
                }
            }

        });

        if (!edicion) {
            notFound();
        }


        return <CalificarCursoModal edicion={edicion} />;
    } catch (error) {
        console.error('Error cargando curso para editar:', error);
        notFound();
    }
}

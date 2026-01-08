import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CalificarCursoModal from './client';
import { getServerSession } from 'next-auth';
interface Props {
    params: Promise<{ id: string }>
}
export default async function CalificarCurso({ params }: Props) {
    const { id } = await params;
    const user = await getServerSession();


    if (user && user.user && user.user.email) {
       
        const edicion = await prisma.edicionesCursos.findUnique({
            where: { id },
            select: {
                curso: {
                    select: {
                        id: true,
                        reviews: {
                            where: {
                                usuario: {
                                    correo: user.user.email
                                }
                            }
                        }
                    }
                }
            }

        });
        if (!edicion) {
            notFound();
        }

        return <CalificarCursoModal edicion={edicion} />;
    }
    return null;
}

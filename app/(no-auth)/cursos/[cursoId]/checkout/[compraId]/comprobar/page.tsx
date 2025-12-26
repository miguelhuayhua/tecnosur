// app/cursos/[id]/checkout/[compraId]/comprobar/page.tsx
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import CompletarRegistroForm from './client';

interface PageProps {
    params: Promise<{
        id: string;
        compraId: string;
    }>;
}

export default async function CompletarRegistroPage({ params }: PageProps) {
    const { id, compraId } = await params;
    const session = await getServerSession();

    // Verificar que el usuario está autenticado
    if (!session) {
        redirect(`/login?callbackUrl=/cursos/${id}/checkout/${compraId}/comprobar`);
    }

    // Obtener datos de la compra y usuario
    const compra = await prisma.compras.findUnique({
        where: { id: compraId },
        include: {
            usuario: {
                select: {
                    correo: true,
                    estudiante: true
                }
            },
            edicion: {
                include: {
                    curso: true
                }
            }
        }
    });

    if (!compra) {
        notFound();
    }

    // Verificar que la compra pertenece al usuario logueado (comparar emails)
    if (compra.usuario?.correo !== session.user?.email) {
        redirect('/mis-cursos');
    }

    // Verificar que la compra no está ya comprobada
    if (compra.comprobado) {
        redirect(`/cursos/${id}/checkout/${compraId}`);
    }

    // Preparar datos para el formulario
    const datosIniciales = {
        email: compra.usuario?.correo || '',
        nombreActual: compra.usuario?.estudiante?.nombre || 'Temporal',
        apellidoActual: compra.usuario?.estudiante?.apellido || 'Usuario',
        celularActual: compra.usuario?.estudiante?.celular || '',
        cursoNombre: compra.edicion.curso.titulo,
        edicionCodigo: compra.edicion.codigo
    };

    return (
        <>
            <div className="min-h-screen bg-background flex items-center justify-center py-8">
                <div className="w-full max-w-md mx-auto px-6">
                    <CompletarRegistroForm
                        compraId={compraId}
                        cursoId={id}
                        datosIniciales={datosIniciales}
                    />
                </div>
            </div>
        </>
    );
}
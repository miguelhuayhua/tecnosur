// app/cursos/[id]/checkout/[compraId]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Footer } from '@/app/componentes/estatico/footer';
import { MainNavbar } from '@/app/componentes/estatico/navbar';
import { CheckCircle, ArrowLeft, User, Calendar, BookOpen, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getServerSession } from 'next-auth';

interface PageProps {
    params: Promise<{
        id: string;
        compraId: string;
    }>;
}

export default async function CheckoutSuccessPage({ params }: PageProps) {
    const { id, compraId } = await params;
    const session = await getServerSession();

    // Verificar que la compra existe (sin try-catch para redirect)
    const compra = await prisma.compras.findUnique({
        where: { id_: compraId },
        include: {
            edicion: {
                select: {
                    id_: true,
                    codigo: true,
                    curso: {
                        include: {
                            categorias: {
                                include: {
                                    categoria: true
                                }
                            }
                        }
                    }
                }
            },
            usuario: {
                select: {
                    id_: true, correo: true,

                    estudiante: true,

                }
            }
        }
    });

    if (!compra || compra.edicion.curso.id_ !== id) {
        notFound();
    }


    // Si la compra está comprobada y el usuario está logueado, mostrar éxito
    if (compra.comprobado && session) {
        return (
            <>
                <MainNavbar />
                <div className="min-h-screen bg-background mt-20 py-8">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                                    <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-foreground mb-4">
                                ¡Inscripción Completada!
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Ya tienes acceso al curso <strong>{compra.edicion.curso.titulo}</strong>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <Card>
                                <CardContent >
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Tu acceso
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Usuario:</span>
                                            <span className="font-medium">{session.user?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Email:</span>
                                            <span className="font-medium">{session.user?.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Estado:</span>
                                            <span className="font-medium text-green-600">Activo</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent >
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Detalles del curso
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Curso:</span>
                                            <span className="font-medium">{compra.edicion.curso.titulo}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Edición:</span>
                                            <span className="font-medium">{compra.edicion.codigo}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Fecha de activación:</span>
                                            <span className="font-medium">
                                                {new Date().toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Monto pagado:</span>
                                            <span className="font-medium">
                                                {compra.monto} {compra.moneda}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="text-center mb-8">
                            <h3 className="font-semibold text-lg mb-4 flex items-center justify-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                ¿Qué sigue?
                            </h3>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <p> Ya tienes acceso completo a todas las clases del curso</p>
                                <p> Podrás ver los materiales y realizar las actividades</p>
                                <p> Tendrás soporte del instructor durante todo el curso</p>
                                <p> Recibirás certificado al completar satisfactoriamente</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild >
                                <Link href={`/dashboard/cursos/${compra.edicionId}`}>
                                    <BookOpen />
                                    Ir al curso
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/cursos">
                                    <Eye />
                                    Ver todos mis cursos
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/cursos">
                                    <ArrowLeft />
                                    Explorar más cursos
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Si la compra NO está comprobada y NO hay usuario logueado → deben loguearse primero
    if (!compra.comprobado && !session) {
        redirect(`/login?callbackUrl=/cursos/${id}/checkout/${compraId}`);
    }

    // Si la compra NO está comprobada pero el usuario está logueado → redirigir a comprobar (editar datos)
    if (!compra.comprobado && session) {
        // Verificar si el usuario logueado es el dueño de la compra comparando emails
        if (compra.usuario.correo === session.user?.email) {
            // Redirigir a completar registro/editar datos
            redirect(`/cursos/${id}/checkout/${compraId}/comprobar`);
        } else {
            // Si no es el dueño, redirigir a mis cursos
            redirect('/dashboard/cursos');
        }
    }

    // Si la compra está comprobada pero el usuario no está logueado → deben loguearse
    if (compra.comprobado && !session) {
        redirect(`/login?callbackUrl=/cursos/${id}/checkout/${compraId}`);
    }

    // Caso por defecto (no debería llegar aquí)
    notFound();
}
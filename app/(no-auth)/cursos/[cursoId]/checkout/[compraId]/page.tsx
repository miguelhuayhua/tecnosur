// app/cursos/[id]/checkout/[compraId]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CheckCircle, ArrowLeft, User, Calendar, BookOpen, Eye, Clock, GraduationCap, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth';
import { Navbar } from '@/app/(no-auth)/static/navbar';
import { Footer } from '@/app/(no-auth)/static/footer';
import Image from 'next/image';
import { ButtonGroup } from '@/components/ui/button-group';
import { Badge } from '@/components/ui/badge';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { Status, StatusIndicator } from '@/components/ui/shadcn-io/status';
interface PageProps {
    params: Promise<{
        cursoId: string;
        compraId: string;
    }>;
}

export default async function CheckoutSuccessPage({ params }: PageProps) {
    const { cursoId, compraId } = await params;
    const session = await getServerSession();
    console.log(session)


    if (session) {
        // Verificar que la compra existe (sin try-catch para redirect)
        const compra = await prisma.compras.findUnique({
            where: { id: compraId, usuario: { id: session.user.id } },
            include: {
                edicion: {
                    include: {
                        clases: { select: { id: true } },
                        curso: true
                    },
                },
                usuario: {
                    select: {
                        id: true,
                        correo: true,
                        registrado: true,
                        estudiante: true,

                    }
                }
            }
        });

        if (!compra) {
            notFound();
        }
        if (compra.usuario?.registrado) {
            if (compra.usuario?.correo == session.user?.email) {
                const curso = compra.edicion.curso;
                const edicion = compra.edicion;
                return (
                    <>
                        <Navbar />
                        <div className="max-w-4xl flex flex-col items-center justify-center mx-auto space-y-6 py-10">
                            <Image alt='fondo de confirmado'
                                className='w-60'
                                width={100} height={100} src='/confirmed.svg' />
                            <div className="">

                                <h1 className="text-xl text-center font-semibold text-foreground mb-2">
                                    ¡Inscripción Completada!
                                </h1>
                                <p className="text-muted-foreground text-center">
                                    Ya tienes acceso al curso <b>{compra.edicion.curso.titulo}</b>
                                </p>
                            </div>


                            <Card className="relative w-full max-w-md">
                                <CardContent className="space-y-3 ">

                                    {/* Header con icono y badge */}
                                    <div className="flex items-center  gap-2 ">
                                        {/* Icono circular pequeño */}
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-border">
                                            {curso.urlMiniatura ? (
                                                <Image
                                                    src={curso.urlMiniatura}
                                                    alt={curso.titulo}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                                    <BookOpen className="h-6 w-6 text-blue-500" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="font-medium text-base  line-clamp-2 leading-tight">
                                                <Link
                                                    href={`/dashboard/cursos/${edicion.id}`}
                                                    className="hover:text-blue-600 transition-colors"
                                                >
                                                    {curso.titulo}
                                                </Link>
                                            </h3>
                                            <Badge variant={'outline'}>
                                                {edicion.codigo}
                                            </Badge>

                                        </div>
                                    </div>
                                    {/* Horarios */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 ">
                                            <Calendar className='size-4 text-muted-foreground' />
                                            <span className="text-xs  text-muted-foreground">Del {format(edicion.fechaInicio, 'dd/MMM/yyyy', { locale: es })} al {format(edicion.fechaFin, 'dd/MMM/yyyy', { locale: es })} </span>
                                        </div>
                                        <div className="flex items-center gap-2 ">
                                            <Clock className='size-4 text-muted-foreground' />
                                            <span className="text-xs  text-muted-foreground">
                                                Horario: {format(edicion.fechaInicio, 'HH:mm')} - {format(edicion.fechaFin, 'HH:mm')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 ">
                                            <GraduationCap className='size-4 text-muted-foreground' />
                                            <span className="text-xs  text-muted-foreground">
                                                <b>{edicion.clases.length}</b> sesiones
                                            </span>
                                        </div>
                                        <Status status={curso.enVivo ? 'online' : 'offline'}>
                                            <StatusIndicator />
                                            {curso.enVivo ? "En vivo" : "Grabado"}
                                        </Status>
                                    </div>

                                </CardContent>
                                <CardFooter>
                                    <ButtonGroup className='w-full'>
                                        <Button className='flex-1' asChild >
                                            <Link href={`/dashboard/cursos/${compra.edicionId}`}>
                                                Ir al curso
                                            </Link>
                                        </Button>

                                        {
                                            edicion.urlWhatsapp && (
                                                <Button variant="ghost" className='bg-green-600 flex-1 text-white' asChild>
                                                    <Link href={edicion.urlWhatsapp} target='_blank'>
                                                        Grupo de Whatsapp
                                                    </Link>
                                                </Button>
                                            )
                                        }
                                    </ButtonGroup>
                                </CardFooter>
                            </Card>


                        </div>
                        <Footer />
                    </>
                );
            } else {
                // Si no es el dueño, redirigir a mis cursos
                redirect('/dashboard/cursos');
            }
        }
        else {
            if (compra.usuario?.correo == session.user?.email) {
                redirect(`/formulario?callbackUrl=/cursos/${cursoId}/checkout/${compraId}&edicionId=${compra.edicionId}`);
            } else {
                // Si no es el dueño, redirigir a mis cursos
                redirect('/formulario');
            }
        }
    }
    else {
        redirect(`/login?callbackUrl=/cursos/${cursoId}/checkout/${compraId}`);
    }
}
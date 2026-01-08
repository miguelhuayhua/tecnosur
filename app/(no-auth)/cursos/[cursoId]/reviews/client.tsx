'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from "next/link";
import {  categorias, cursos, estudiantes, reviewsCursos } from "@/prisma/generated";
import { useSession } from "next-auth/react";
import { Star, StarHalf } from "lucide-react";
import { notFound } from "next/navigation";
import { YouTubePlayer } from "@/components/ui/youtube-video-player";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ReviewComponent from "../review";

interface Curso extends cursos {
    ediciones: Array<{ codigo: string, creadoEn: Date, clases: Array<{ titulo: string, urlPresentacion: string | null, duracion: number | null }> }>
    categorias: Array<{ categoria: categorias }>
    reviews: Array<reviewsCursos & { usuario: { estudiante: estudiantes | null, avatar: string | null, usuario: string } | null }>
}

export default function CursoReviewsClient({ curso }: { curso: Curso }) {
    const edicionPrincipal = curso.ediciones.at(0);
    const { data } = useSession();
    if (!edicionPrincipal) return notFound();
    const claseBienvenida = edicionPrincipal.clases.at(0)
    const totalReviews = curso.reviews.length;
    const promedioRating = totalReviews > 0
        ? curso.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    return (
        <div className="p-5 md:px-15 lg:px-20 xl:px-50 grid lg:grid-cols-3 gap-4">
            <div className="space-y-3 col-span-2">
                <h1 className="text-4xl font-semibold">
                    Opiniones del Curso {curso.titulo}
                </h1>

                <div className="flex items-center gap-2">
                    {/* Estrellas */}
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((estrella) => {
                            if (promedioRating >= estrella) {
                                return <Star key={estrella} className="fill-yellow-500 text-yellow-500 size-4" />;
                            } else if (promedioRating >= estrella - 0.5) {
                                return <StarHalf key={estrella} className="fill-yellow-500 text-yellow-500 size-4" />;
                            } else {
                                return <Star key={estrella} className="text-gray-300 size-4" />;
                            }
                        })}
                    </div>

                    {/* Puntuación */}
                    <p className="font-semibold text-sm">
                        {promedioRating.toFixed(1)} ({totalReviews} reseñas)
                    </p>

                </div>
                <p className="text-xs text-muted-foreground font-normal">
                    Publicado el {format(edicionPrincipal.creadoEn, "dd 'de' MMMM 'del' yyyy", { locale: es })}
                </p>
                <div className="space-x-1">
                    {
                        curso.categorias.map(({ categoria }) => <Badge key={categoria.id} variant={'outline'}>{categoria.nombre}</Badge>)
                    }
                </div>
                <p >
                    {curso.descripcion}
                </p>
                <Breadcrumb className="my-8">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/cursos">Cursos</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/cursos/${curso.urlCurso || curso.id}`}>
                                {curso.titulo}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`#`}>
                                Opiniones
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div>
                <Card className="pt-0  gap-0">
                    <CardContent className="p-0">
                        {
                            claseBienvenida && claseBienvenida.urlPresentacion ?
                                <YouTubePlayer videoId={claseBienvenida.urlPresentacion} /> :
                                <div className="relative w-full h-50 ">
                                    <Image src={curso.urlMiniatura || '/placeholder.svg'} className='object-cover' fill alt='portada curso' />

                                </div>
                        }
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href={`/cursos/${curso.id}/checkout`}>
                                Compra el Curso Ahora
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="col-span-3 gap-4 grid sm:grid-cols-2 lg:grid-cols-3">
                {
                    curso.reviews.map(review => (<ReviewComponent review={review} userId={data?.user.id} />))
                }
            </div>
        </div>
    );
}
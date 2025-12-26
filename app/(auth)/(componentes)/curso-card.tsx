'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { usePriceFormatter } from '@/hooks/use-price-formatter';
import { BarChart, Calendar, Star } from 'lucide-react';
import { Curso } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Status, StatusIndicator } from '@/components/ui/shadcn-io/status';


export const CursoCard: React.FC<{ curso: Curso } & React.HtmlHTMLAttributes<HTMLDivElement>> = ({ curso }) => {
    const [isHovered, setIsHovered] = useState(false);
    const edicionActiva = curso.ediciones?.find(ed => ed.estado === 'ACTIVA') || curso.ediciones?.[0];

    const calcularRatingPromedio = () => {
        if (!curso.reviews || curso.reviews.length === 0) return 0;
        const suma = curso.reviews.reduce((acc, review) => acc + review.rating, 0);
        return suma / curso.reviews.length;
    };

    const truncateDescription = (text: string, maxLength: number) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <Link onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(isHovered ? ' -translate-y-1/4 z-10 duration-300 transition-all scale-115 !rounded-b-none' : 'translate-y-0 transition-all', 'relative')}
            href={`/cursos/${curso.urlCurso || curso.id}`}>
            <Card
                className={cn("w-full  flex flex-col ease-in border-none   p-0 relative  transition-all duration-300 shadow-md !rounded-xl shadow-none !bg-transparent  cursor-pointer group", isHovered && ('!rounded-b-none'))}>
                <Status className='absolute top-3 left-3 z-10' status={curso.enVivo ? "online" : "offline"}>
                    <StatusIndicator />
                    {curso.enVivo ? "Curso en vivo" : "Curso grabado"}
                </Status>

                {/* Header con imagen */}

                {curso.urlMiniatura && (
                    <CardHeader className={cn("relative h-40 w-full", !isHovered && ('!rounded-xl'))}>
                        <Image
                            src={curso.urlMiniatura}
                            alt={curso.titulo}
                            fill
                            className={cn("object-cover")}
                        />
                        {(<div className={cn('w-full transition-all bg-gradient-to-b  from-transparent to-transparent size-full absolute ', isHovered && ('bg-gradient-to-t from-black/80 to-transparent'))} />)}
                        {
                            isHovered && (
                                <CardTitle className={cn("absolute bottom-2 left-2 right-2  text-sm font-semibold text-white",)}>
                                    {curso.titulo}
                                </CardTitle>)
                        }
                    </CardHeader>
                )}
            </Card>
            <div className={cn(" absolute overflow-hidden bottom-auto transition-all duration-300 w-full !bg-transparent cursor-pointer group")} >
                <CardContent className={cn("bg-card  pt-2 ", "transition-all ", !isHovered ? "translate-x-1/6 opacity-0" : 'translate-x-0 opacity-100')}>


                    {/* Descripción */}
                    <CardDescription className='text-xs'>
                        {truncateDescription(curso.descripcionCorta || 'Sin descripción', 120)}
                    </CardDescription>
                    <p className='text-blue-500 text-xs font-semibold'>
                        Más información
                    </p>
                    {/* Categorías */}
                    {curso.categorias && (
                        <div className="flex flex-wrap gap-1">
                            {curso.categorias.slice(0, 2).map((cat, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                    {cat.categoria.nombre}
                                </Badge>
                            ))}
                            {curso.categorias.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{curso.categorias.length - 2}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className={cn(" mt-auto rounded-b-xl  bg-muted -mt-0.5  border-x border-b overflow-hidden space-y-3", "transition-all ", !isHovered ? "translate-x-1/6 opacity-0" : 'translate-x-0 opacity-100')}>
                    <div className='text-xs justify-center flex divide-x '>
                        <p className='flex items-center gap-1 pr-2'>
                            <Calendar className='size-3' />
                            <span>
                                {format(edicionActiva.fechaInicio, 'MMM yyyy', { locale: es })}
                            </span>
                        </p>
                        <p className='flex items-center gap-1 px-2'>
                            <BarChart className='size-3' />
                            Intermedio
                        </p>
                        <p className='flex items-center gap-1 px-2'>
                            <Star className='size-3' />
                            {calcularRatingPromedio()}
                        </p>
                    </div>
                </CardFooter>
            </div>
        </Link >
    );
};
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { usePriceFormatter } from '@/hooks/use-price-formatter';
import { Check, Eye, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ButtonGroup } from '@/components/ui/button-group';
import { Button } from '@/components/ui/button';
import { FaWhatsapp } from 'react-icons/fa';
import { Status, StatusIndicator } from '@/components/ui/shadcn-io/status';
import { Cursos } from '@/hooks/use-cursos';

export const CursoGeneral: React.FC<{ curso: Cursos } & React.HtmlHTMLAttributes<HTMLDivElement>> = ({
  curso,
  className,
}) => {
  const { formatPrice } = usePriceFormatter();
  const whatsappUrl = `https://wa.me/5916988691?text=Hola%20me%20interesa%20el%20curso%20${encodeURIComponent(curso.titulo)}`;
  const edicionActiva = curso.ediciones?.find(ed => ed.estado === 'ACTIVA') || curso.ediciones?.[0];
  const preciosEdicion = edicionActiva?.precios || [];
  const tienePrecios = preciosEdicion.length > 0;
  const precioDefault = tienePrecios
    ? preciosEdicion.find(p => p.esPrecioDefault) || preciosEdicion[0]
    : null;
  const precioConvertido = precioDefault ? formatPrice(precioDefault.precio) : null;
  const precioOriginalConvertido = precioDefault?.precioOriginal ? formatPrice(precioDefault.precioOriginal) : null;

  const calcularRatingPromedio = () => {
    if (!curso.reviews || curso.reviews.length === 0) return 0;
    const suma = curso.reviews.reduce((acc, review) => acc + review.rating, 0);
    return suma / curso.reviews.length;
  };

  const ratingPromedio = calcularRatingPromedio();
  const totalReviews = curso.reviews?.length || 0;

  const truncateDescription = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };



  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={`/cursos/${curso.urlCurso || curso.id}`}>
          <Card className={cn("w-full  flex flex-col overflow-hidden shadow-none transition-all duration-300  cursor-pointer group", className)}>
            {/* Header con imagen */}
            <CardHeader>
              {curso.urlMiniatura && (
                <div className="relative h-40 w-full rounded-md overflow-hidden">
                  <Image
                    src={curso.urlMiniatura}
                    alt={curso.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                </div>
              )}
            </CardHeader>

            <CardContent className='pb-0' >
              <CardTitle className='flex items-center gap-2 justify-between'>
                {curso.titulo}
                <Status status={curso.enVivo ? "online" : "offline"}>
                  <StatusIndicator />
                  {curso.enVivo ? "En vivo" : "Grabado"}
                </Status>
              </CardTitle>
              {/* Descripción */}
              <CardDescription className='text-xs'>
                {truncateDescription(curso.descripcion, 120)}
              </CardDescription>

              <div className='space-x-2 flex items-center mt-4'>
                <Badge variant={'outline'}>
                  <Star className='fill-yellow-600 text-yellow-600' /> {ratingPromedio}
                </Badge>
                <Badge variant={'outline'}>
                  {totalReviews || 'Sin'} valoraciones {totalReviews <= 0 && (' aún')}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className='border-t-0 px-4'>
              {/* Precios - Solo mostrar si existen */}
              {tienePrecios && precioDefault ? (
                <div className="w-full ">
                  {/* Precio principal */}
                  <div className="flex items-center justify-between">

                    {(precioDefault.esPrecioDefault) && (
                      <div className="flex items-baseline gap-2 text-md">
                        <span className='font-semibold'>
                          {precioConvertido?.value} {precioConvertido?.code}
                        </span>
                        {
                          precioDefault.esDescuento && (
                            <span className='text-muted-foreground line-through'>
                              {precioOriginalConvertido?.value} {precioOriginalConvertido?.code}
                            </span>
                          )
                        }
                      </div>
                    )}

                  </div>

                  {/* Nombre del precio si no es el default */}
                  {!precioDefault.esPrecioDefault && (
                    <div className="text-xs text-muted-foreground">
                      {precioDefault.nombre}
                    </div>
                  )}
                </div>
              ) : (
                // Mostrar mensaje cuando no hay precios
                <div className="w-full text-center py-2">
                  <Badge variant="outline" className="text-xs">
                    Precio no disponible
                  </Badge>
                </div>
              )}
            </CardFooter>
          </Card>
        </Link>
      </TooltipTrigger>
      <TooltipContent className='p-4 pb-2 w-sm space-y-1' >
        <h3 className='text-md font-medium'>
          {curso.titulo}
        </h3>
        <Badge variant={'secondary'}>
          Edición: {edicionActiva.codigo}
        </Badge>
        <br />
        <small className='text-green-700'>
          Actualizado el: {format(edicionActiva.creadoEn, 'dd MMM yyyy')}
        </small>
        <p className='text-sm text-muted-foreground'>
          {curso.descripcion}
        </p>
        {
          curso.objetivos.length > 0 && (
            <>
              <h4 className='font-semibold text-sm'>
                Objetivos
              </h4>
              <ul>
                {curso.objetivos.map(value =>
                  <li className='text-sm flex items-center gap-1' key={value.id}>
                    <Check className='size-4 text-green-600' />
                    {value.descripcion}
                  </li>
                )}
              </ul>
            </>
          )
        }
        <ButtonGroup className='w-full mt-4'>
          <Button size={'sm'} asChild className="flex-1">
            <Link href={`/cursos/${curso.urlCurso || curso.id}`}>
              <Eye className="mr-2" />
              Más información
            </Link>
          </Button>

          <Button
            asChild
            size={'sm'}
            variant="outline"
            className="border-green-500 w-1/6 text-green-600 hover:bg-green-50 hover:text-green-700"
          >
            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </Link>
          </Button>
        </ButtonGroup>
      </TooltipContent>
    </Tooltip>

  );
};
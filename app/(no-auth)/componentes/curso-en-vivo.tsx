'use client';

import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from 'next/link';
import { categorias, categoriasCursos, cursos, edicionesCursos, objetivosCursos, preciosCursos, reviewsCursos } from "@/prisma/generated"
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePriceFormatter } from '@/hooks/use-price-formatter';
import { Star, GraduationCap, Eye, Calendar, Clock, Timer } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { ButtonGroup } from '@/components/ui/button-group';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaWhatsapp } from 'react-icons/fa';
import { Status, StatusIndicator } from '@/components/ui/shadcn-io/status';

// Interfaz que coincide EXACTAMENTE con lo que devuelve la API
interface CursoAPI extends cursos {
  ediciones: Array<edicionesCursos & { precios: preciosCursos[], _count: { clases: number } }>;
  categorias: (categoriasCursos & { categoria: categorias })[]
  reviews: Array<reviewsCursos>;
  objetivos: Array<objetivosCursos>;
}

interface CursoCardProps {
  curso: CursoAPI;
}

export const CursoCardDetalladoVertical: React.FC<CursoCardProps & React.HtmlHTMLAttributes<HTMLDivElement>> = ({
  curso,
  className,
}) => {
  const { formatPrice } = usePriceFormatter();
  // Obtener la edición activa o la primera disponible
  const edicionActiva = curso.ediciones?.find(ed => ed.estado === 'ACTIVA') || curso.ediciones?.[0];

  // Obtener precios de la edición activa
  const preciosEdicion = edicionActiva?.precios || [];
  const tienePrecios = preciosEdicion.length > 0;

  // Buscar precio por defecto o tomar el primero
  const precioDefault = tienePrecios
    ? preciosEdicion.find(p => p.esPrecioDefault) || preciosEdicion[0]
    : null;

  // Verificar si hay descuento
  const tieneDescuento = precioDefault?.esDescuento;

  // Formatear precios
  const precioConvertido = precioDefault ? formatPrice(precioDefault.precio) : null;
  const precioOriginalConvertido = precioDefault?.precioOriginal ? formatPrice(precioDefault.precioOriginal) : null;

  // Calcular rating promedio
  const calcularRatingPromedio = () => {
    if (!curso.reviews || curso.reviews.length === 0) return 0;
    const suma = curso.reviews.reduce((acc, review) => acc + review.rating, 0);
    return suma / curso.reviews.length;
  };

  const ratingPromedio = calcularRatingPromedio();
  const totalReviews = curso.reviews?.length || 0;


  // Calcular días restantes
  const calcularDiasRestantes = (fecha: Date) => {
    const hoy = new Date();
    const fechaInicio = new Date(fecha);
    const diferencia = fechaInicio.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const diasRestantes = edicionActiva?.fechaInicio
    ? calcularDiasRestantes(edicionActiva.fechaInicio)
    : null;
  // Componente de estrellas
  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex  items-center gap-2">
        <Star className='size-4 text-muted-foreground ' />
        <span className=" text-xs font-bold text-muted-foreground">
          {rating.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">
          ({totalReviews || 'Sin reseñas aun'})
        </span>
      </div>
    );
  };

  // WhatsApp URL
  const whatsappUrl = `https://wa.me/5916988691?text=Hola%20me%20interesa%20el%20curso%20${encodeURIComponent(curso.titulo)}`;

  return (
    <Card className={cn(
      " group pt-0 transition-all duration-300",
      className
    )}>
      {/* Imagen principal */}
      <Link href={`/cursos/${curso.urlCurso || curso.id}`} className="relative h-56 w-full overflow-hidden">
        {curso.urlMiniatura ? (
          <Image
            src={curso.urlMiniatura}
            alt={curso.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 100vw"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/40 flex items-center justify-center">
            <div className="text-center">
              <GraduationCap className="w-16 h-16 text-white/60 mx-auto mb-3" />
              <p className="text-white font-bold text-lg">TecSur Perú</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />


        {tieneDescuento && precioDefault?.porcentajeDescuento && (
          <div className="absolute top-3 right-3">
            <Badge variant={'destructive'}>
              -{precioDefault.porcentajeDescuento}% Descuento
            </Badge>
          </div>
        )}

        {
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {curso.categorias.slice(0, 2).map((cat, index) => (
              <Badge
                key={index}
                variant="secondary"
              >
                {cat.categoria.nombre}
              </Badge>
            ))}
          </div>
        }
      </Link>

      <CardContent className="space-y-4">
        {/* SECCIÓN 1: TÍTULO Y RATING/PRECIO */}
        <div className="space-y-3">
          <div className='flex justify-between items-center'>
            <h2 className="text-lg font-semibold leading-tight flex-1 line-clamp-2 text-foreground">
              <Link href={`/cursos/${curso.urlCurso || curso.id}`}>

                {curso.titulo}
              </Link>
            </h2>
            <Status status='online'>
              <StatusIndicator />
              Curso en vivo
            </Status>
          </div>
          <div className="flex items-center justify-between">

            {(tienePrecios && precioDefault) && (
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

            )}
          </div>
        </div>

        {/* SECCIÓN 4: FECHAS */}
        {edicionActiva && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 ">
              <Calendar className='size-4 text-muted-foreground'></Calendar>
              <span className="text-xs  text-muted-foreground">Del {format(edicionActiva.fechaInicio, 'dd/MMM/yyyy', { locale: es })} al {format(edicionActiva.fechaFin, 'dd/MMM/yyyy', { locale: es })} </span>
            </div>
            <div className="flex items-center gap-2 ">
              <Clock className='size-4 text-muted-foreground' />
              <span className="text-xs  text-muted-foreground">
                Horario: {format(edicionActiva.fechaInicio, 'HH:mm')} - {format(edicionActiva.fechaFin, 'HH:mm')}
              </span>
            </div>
            <div className="flex items-center gap-2 ">
              <GraduationCap className='size-4 text-muted-foreground' />
              <span className="text-xs  text-muted-foreground">
                <b>{edicionActiva._count.clases}</b> sesiones
              </span>
            </div>
            <StarRating rating={ratingPromedio} />
            <div className="flex items-center gap-2 ">
              <Timer className='size-4 text-muted-foreground' />
              <span className="text-xs text-muted-foreground">Te quedan {" "}
                <b>
                  {diasRestantes}
                </b> {diasRestantes === 1 ? 'día' : 'días'}
              </span>
            </div>

          </div>
        )}
        <Separator />
        <p className='text-xs'>
          {curso.descripcionCorta}
        </p>


      </CardContent>

      <CardFooter className='mt-auto' >
        <ButtonGroup className='w-full'>
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
            className="border-green-500 w-1/6 text-green-600 bg-background hover:bg-green-50 hover:text-green-700"
          >
            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp />
            </Link>
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};

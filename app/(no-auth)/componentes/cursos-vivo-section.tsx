'use client';

import { useCursos } from '@/hooks/use-cursos';
import { CursoCardDetalladoVerticalSkeleton } from '../static/curso-en-vivo-skeleton';
import { CursoCardDetalladoVertical } from './curso-en-vivo';
import { FlipCard } from '@/components/ui/card-back-flip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { YouTubePlayer } from '@/components/ui/youtube-video-player';
import Image from 'next/image';
import Link from 'next/link';
import { InteractiveButton } from '@/components/ui/interactive-button';
export default function List() {
  const { cursos, isLoading, error } = useCursos({
    limit: 3,
    sortBy: 'creadoEn',
    sortOrder: 'desc',
    enVivo: "true"
  });
  return (
    <section id="en-vivo" className="py-10">

      <div className="container mx-auto px-4">
        {/* Header con título y status al lado */}
        <div className="mb-8 flex justify-between items-center">
          <h2 className="font-bold   text-2xl">Cursos en vivo</h2>

          <InteractiveButton >
            <Link href="/cursos?enVivo=true">
              Ver más
            </Link>
          </InteractiveButton>

        </div>

        {/* Cursos */}
        {error && (
          <div className="text-center py-4">
            <p className="text-destructive">Error al cargar los cursos</p>
          </div>
        )}

        {isLoading && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <CursoCardDetalladoVerticalSkeleton key={index} />
            ))}
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso) => {
              const edicion = curso.ediciones.at(0);
              const clase = edicion?.clases.at(0);
              return (
                <FlipCard
                  key={curso.id}
                  back={
                    <Card className='h-full'>
                      <CardHeader>
                        {clase?.urlPresentacion && (
                          <YouTubePlayer
                            expandButtonClassName='hidden'
                            titleClassName='hidden'
                            playButtonClassName='size-12!'
                            customThumbnail={curso.urlMiniatura || "/placeholder.svg"}
                            videoId={clase.urlPresentacion}
                          />
                        )}
                        {
                          !clase?.urlPresentacion && (
                            <Image
                              className='rounded-md'
                              src={curso.urlMiniatura || "/placeholder.svg"}
                              alt={curso.titulo}
                              width={500}
                              height={500}
                            />
                          )
                        }
                      </CardHeader>
                      <CardContent>
                        <p>
                          {curso.descripcion || "Sin descripción"}
                        </p>
                      </CardContent>
                      <CardFooter className="mt-auto">
                        <Button asChild className='w-full'>
                          <Link href={`/curso/${curso.urlCurso || curso.id}`}>
                            Ver más sobre el Curso
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  }
                >
                  <CursoCardDetalladoVertical
                    curso={curso}
                  />
                </FlipCard>

              )

            })}

            {cursos.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No se encontraron cursos</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  CheckCircle2,
  PlayCircle,
  MessageCircle,
  Award,
  BookOpen,
  Link as LinkIcon,
  Eye,
  FileBadge,
  Calendar1,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { categorias, categoriasCursos, clases, cursos, edicionesCursos, examenes, materiales } from "@/prisma/generated"
import { format } from "date-fns"
import { ButtonGroup } from "@/components/ui/button-group"
import { FaWhatsapp } from "react-icons/fa"
import { ScrollArea } from "@/components/ui/scroll-area"
import { YouTubePlayer } from "@/components/ui/youtube-video-player"

interface EdicionCurso extends edicionesCursos {

  curso: cursos & { categorias: Array<categoriasCursos & { categoria: categorias }> };
  clases: Array<clases & { materiales: Array<materiales> }>;
  examenes: Array<examenes>;
}



export default function CursoEstudianteDetalle({ edicion }: { edicion: EdicionCurso }) {
  const [claseSeleccionada, setClaseSeleccionada] = useState<clases & { materiales: Array<materiales> } | null>(edicion.clases[0] || null)
  const { id } = useParams();

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(fecha));
  }

  const formatDuracion = (minutos?: number) => {
    if (!minutos) return ''
    if (minutos < 60) return `${minutos} min`
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}min`
  }

  // Obtener días únicos de las clases basado en las fechas
  const getDiasClase = () => {
    const diasUnicos = new Set<string>()

    edicion.clases.forEach(clase => {
      const dia = new Intl.DateTimeFormat('es-BO', { weekday: 'long' }).format(new Date(clase.fecha))
      diasUnicos.add(dia)
    })

    const diasArray = Array.from(diasUnicos)
    return diasArray.length > 0 ? diasArray.join(', ') : 'No hay clases programadas'
  }

  return (
    <div className="min-h-screen mt-6 ">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header del curso */}
        <div >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Imagen del curso */}
            {edicion.curso.urlMiniatura && (
              <div className="relative w-full md:w-96 h-56 rounded-lg overflow-hidden">
                <Image
                  src={edicion.curso.urlMiniatura}
                  alt={edicion.curso.titulo}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Información principal */}
            <div className="flex-1 space-y-4">
              {/* Título y categorías */}
              <div className="space-y-3">
                <h1 className="text-xl font-bold">{edicion.curso.titulo}</h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{edicion.codigo}</Badge>
                  {edicion.curso.categorias.map(({ categoria }) => (
                    <Badge key={categoria.id} variant="secondary">
                      {categoria.nombre}
                    </Badge>
                  ))}
                </div>
                <p className="leading-relaxed text-sm">{edicion.curso.descripcion}</p>
              </div>

              {/* Fechas y horarios */}
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span> Del {formatFecha(edicion.fechaInicio)} al {formatFecha(edicion.fechaFin)}</span>
                  </div>

                </div>
                <div className="flex items-center gap-2">
                  <Calendar1 className="h-4 w-4" />
                  <span>Clases los {getDiasClase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{format(edicion.fechaInicio, 'HH:mm')} - {format(edicion.fechaFin, 'HH:mm')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Separator />
        {/* Botones de acción */}
        <ButtonGroup>
          {edicion.urlWhatsapp && (
            <Button asChild className="bg-green-700 text-white hover:bg-green-800 border-green-700">
              <Link href={edicion.urlWhatsapp} target="_blank">
                <FaWhatsapp />
                WhatsApp
              </Link>
            </Button>
          )}
          <Button asChild >
            <Link href={`/dashboard/calendario`}>
              <Calendar />
              Calendario
            </Link>
          </Button>
          <Button variant="outline" asChild >
            <Link href={`/dashboard/cursos/${id}/calificaciones`}>
              <Award />
              Ver calificaciones
            </Link>
          </Button>

        </ButtonGroup>
        {/* Contenido principal - Lista de clases y materiales */}
        <div className="grid lg:grid-cols-3  gap-8">
          {/* Lista de clases (scrollable) */}
          <ScrollArea className="lg:col-span-1 px-3 max-h-[600px] ">
            <div className="space-y-3">
              <div className="flex align-items-center bg-background justify-between pb-2 border-b  sticky top-0">
                <h2 className="text-md">Clases del Curso</h2>

                <Badge className="rounded-full font-bold" variant={'secondary'}>
                  {edicion.clases.length}
                </Badge>
              </div>
              <div className=" space-y-3">
                {edicion.clases.length > 0 ? (
                  edicion.clases.map((clase) => (
                    <Card
                      key={clase.id}
                      className={`cursor-pointer transition-colors hover:border-primary ${claseSeleccionada?.id === clase.id ? 'border-primary bg-secondary  ' : ''
                        }`}
                      onClick={() => setClaseSeleccionada(clase)}
                    >
                      <CardContent >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                Clase {clase.orden}
                              </span>
                              {clase.duracion && (
                                <span className="text-xs text-muted-foreground">
                                  • {formatDuracion(clase.duracion)}
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-sm line-clamp-2 mb-1">{clase.titulo}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {formatFecha(clase.fecha)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <PlayCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No hay clases programadas</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Materiales de la clase seleccionada */}
          <div className="lg:col-span-2">
            {claseSeleccionada ? (
              <div className="space-y-4">
                {/* Información de la clase */}
                <div className="space-y-3">
                  <h2 className="text-lg font-bold">{claseSeleccionada.titulo}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span>Clase {claseSeleccionada.orden}</span>
                    <span>•</span>
                    <span>{formatFecha(claseSeleccionada.fecha)}</span>
                    {claseSeleccionada.duracion && (
                      <>
                        <span>•</span>
                        <span>{formatDuracion(claseSeleccionada.duracion)}</span>
                      </>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{claseSeleccionada.descripcion}</p>
                </div>

                <Separator />

                {/* Enlace de YouTube con botón estilo YouTube */}
                {claseSeleccionada.urlYoutube ? (
                  <YouTubePlayer
                    videoId={claseSeleccionada.urlYoutube}
                    title={claseSeleccionada.titulo}
                    customThumbnail={edicion.curso.urlMiniatura || ''}
                  />
                ) : (
                  <YouTubePlayer
                    videoId={''}
                    title={"La clase aún no cuenta con un video"}
                  />
                )
                }
                <Separator />
                <h3 className="text-md">
                  Lista de materiales
                </h3>
                {/* Materiales */}
                {claseSeleccionada.materiales.length > 0 ? (
                  <div className="flex gap-2 flex-wrap wrap">
                    {
                      claseSeleccionada.materiales.map(material => (
                        <Badge key={material.id} asChild variant='outline'>
                          <Link target="_blank" href={material.url}>
                            <span className="border-r pr-1">
                              {material.tipo}
                            </span>
                            {material.titulo}
                            <ExternalLink />
                          </Link>
                        </Badge>
                      ))
                    }
                  </div>
                ) : (
                  <Badge>
                    Sin materiales
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Selecciona una clase</h3>
                <p className="text-muted-foreground">
                  Elige una clase del listado para ver sus materiales y contenido
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
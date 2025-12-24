"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Video,
  Download,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle2,
  PlayCircle,
  MessageCircle,
  Award,
  BookOpen,
  Link as LinkIcon,
  Eye,
  FileBadge
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

interface EdicionCurso {
  id: string;
  codigo: string;
  descripcion?: string;
  estado: string;
  fechaInicio: Date;
  fechaFin: Date;
  urlWhatsapp?: string;
  vigente: boolean;
  certificadoGenerado?: boolean;
  urlCertificado?: string;
  curso: {
    id: string;
    titulo: string;
    descripcion: string;
    urlMiniatura?: string;
    categorias: Categoria[];
  };
  clases: Clase[];
  examenes: Examen[];
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Clase {
  id: string;
  titulo: string;
  descripcion: string;
  urlYoutube?: string;
  duracion?: number;
  fecha: Date;
  orden: number;
  materiales: Material[];
  completada?: boolean;
}

interface Material {
  id: string;
  titulo: string;
  tipo: string;
  url: string;
}

interface Examen {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaDisponible: Date;
  fechaLimite: Date;
  notaMinima: number;
  notaMaxima: number;
}

interface CursoDetalleProps {
  edicion: EdicionCurso;
}

export default function CursoEstudianteDetalle({ edicion }: CursoDetalleProps) {
  const [claseSeleccionada, setClaseSeleccionada] = useState<Clase | null>(edicion.clases[0] || null)
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

  // Verificar si el certificado está disponible
  const certificadoDisponible = edicion.certificadoGenerado && edicion.urlCertificado

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header del curso */}
        <div className="border-b pb-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Imagen del curso */}
            {edicion.curso.urlMiniatura && (
              <div className="relative w-full lg:w-96 h-56 rounded-lg overflow-hidden">
                <Image
                  src={edicion.curso.urlMiniatura}
                  alt={edicion.curso.titulo}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Información principal */}
            <div className="flex-1 space-y-6">
              {/* Título y categorías */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">{edicion.curso.titulo}</h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{edicion.codigo}</Badge>
                  {edicion.curso.categorias.map((categoria) => (
                    <Badge key={categoria.id} variant="secondary">
                      {categoria.nombre}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">{edicion.curso.descripcion}</p>
              </div>

              {/* Fechas y horarios */}
              <div className="space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span><b>Inicio:</b> {formatFecha(edicion.fechaInicio)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span><b>Fin:</b> {formatFecha(edicion.fechaFin)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span><b>Días de clase:</b> {getDiasClase()}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3 pt-4">
                {edicion.urlWhatsapp && (
                  <Button asChild size="sm" className="bg-green-700 text-white hover:bg-green-800 border-green-700">
                    <Link href={edicion.urlWhatsapp} target="_blank">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Link>
                  </Button>
                )}
                <Button variant="secondary" asChild size="sm">
                  <Link href={`/dashboard/calendario`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendario
                  </Link>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <Link href={`/dashboard/cursos/${id}/calificaciones`}>
                    <Award className="h-4 w-4 mr-2" />
                    Ver calificaciones
                  </Link>
                </Button>
                {certificadoDisponible ? (
                  <Button variant="outline" asChild size="sm">
                    <Link href={edicion.urlCertificado!} target="_blank">
                      <FileBadge className="h-4 w-4 mr-2" />
                      Ver Certificado
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <FileBadge className="h-4 w-4 mr-2" />
                    Certificado No Disponible
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal - Lista de clases y materiales */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de clases (scrollable) */}
          <div className="lg:col-span-1">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold mb-4">Clases del Curso</h2>
              <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2">
                {edicion.clases.length > 0 ? (
                  edicion.clases.map((clase) => (
                    <Card
                      key={clase.id}
                      className={`cursor-pointer transition-colors hover:border-primary ${
                        claseSeleccionada?.id === clase.id ? 'border-primary border-2 ' : ''
                      }`}
                      onClick={() => setClaseSeleccionada(clase)}
                    >
                      <CardContent >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {clase.completada ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <PlayCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
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
          </div>

          {/* Materiales de la clase seleccionada */}
          <div className="lg:col-span-2">
            {claseSeleccionada ? (
              <div className="space-y-6">
                {/* Información de la clase */}
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">{claseSeleccionada.titulo}</h2>
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
                  <p className="text-muted-foreground leading-relaxed">{claseSeleccionada.descripcion}</p>
                </div>

                <Separator />

                {/* Enlace de YouTube con botón estilo YouTube */}
                {claseSeleccionada.urlYoutube && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Video de la clase
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        asChild 
                        className="bg-red-600 text-white hover:bg-red-700 transition-colors"
                        size="lg"
                      >
                        <Link href={claseSeleccionada.urlYoutube} target="_blank">
                          <div className="flex items-center gap-2">
                            <Video className="h-5 w-5" />
                            <span>Ver en YouTube</span>
                          </div>
                        </Link>
                      </Button>
                      
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Serás redirigido a YouTube para ver el video de la clase.
                    </p>
                  </div>
                )}

                {/* Materiales */}
                {claseSeleccionada.materiales.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Materiales de apoyo ({claseSeleccionada.materiales.length})
                    </h3>
                    <div className="space-y-3">
                      {claseSeleccionada.materiales.map((material) => (
                        <Card key={material.id}>
                          <CardContent >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded ">
                                  {material.tipo === 'video' ? (
                                    <Video className="h-5 w-5" />
                                  ) : material.tipo === 'link' ? (
                                    <LinkIcon className="h-5 w-5" />
                                  ) : (
                                    <FileText className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{material.titulo}</div>
                                  <div className="text-sm text-muted-foreground capitalize">
                                    {material.tipo}
                                  </div>
                                </div>
                              </div>
                              <Button asChild size="sm" variant="outline">
                                <Link href={material.url} target="_blank">
                                  {material.tipo === 'link' ? (
                                    <ExternalLink className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No hay materiales</h3>
                    <p className="text-muted-foreground text-sm">
                      Esta clase no tiene materiales adicionales
                    </p>
                  </div>
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
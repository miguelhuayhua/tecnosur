"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Calendar, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { format } from "date-fns"

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  urlMiniatura?: string | null;
  fechaInicio: Date;
  fechaFin: Date;
  creadoEn: Date;
  categorias: Categoria[];
  clases?: Clase[];
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Clase {
  id: string;
  titulo: string;
  duracion?: number;
  orden: number;
}

interface CursosGridProps {
  cursos: Curso[];
}

export function CursosGrid({ cursos }: CursosGridProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCursos = cursos.filter(curso => {
    return curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(fecha));
  }

  const getEstadoCurso = (fechaInicio: Date, fechaFin: Date) => {
    const ahora = new Date()
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (ahora < inicio) return { texto: "Próximo", color: "bg-blue-500" }
    if (ahora > fin) return { texto: "Finalizado", color: "bg-gray-500" }
    return { texto: "En Curso", color: "bg-green-500" }
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Header con búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar en mis cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredCursos.length} {filteredCursos.length === 1 ? 'curso' : 'cursos'}
        </div>
      </div>

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCursos.map((curso) => {
          const estado = getEstadoCurso(curso.fechaInicio, curso.fechaFin)
          const totalClases = curso.clases?.length || 0

          return (
            <Card
              key={curso.id}
              className="hover:shadow-lg transition-shadow h-full flex flex-col"
            >
              <CardContent className="flex flex-col h-full">
                {/* Header con icono y badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
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

                  {/* Badge de estado */}
                  <Badge className={`${estado.color} text-white text-xs font-semibold px-2 py-0.5 flex-shrink-0`}>
                    {estado.texto}
                  </Badge>
                </div>

                {/* Título */}
                <h3 className="font-bold text-base mb-2 line-clamp-2 leading-tight">
                  <Link
                    href={`/dashboard/cursos/${curso.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {curso.titulo}
                  </Link>
                </h3>

                {/* Información compacta */}
                <div className="space-y-2 mb-4 flex-1">
                  {/* Número de clases */}
                  {totalClases > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="font-medium">{totalClases} {totalClases === 1 ? 'clase' : 'clases'}</span>
                    </div>
                  )}

                  {/* Fechas en una línea */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {formatFecha(curso.fechaInicio)} - {formatFecha(curso.fechaFin)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {format(curso.fechaInicio, 'HH:mm')} - {format(curso.fechaFin, 'HH:mm')}
                    </span>
                  </div>
                </div>

                {/* Botón */}
                <Button asChild variant={'secondary'} className="w-full" size="sm">
                  <Link href={`/dashboard/cursos/${curso.id}`}>
                    Ir al curso
                    <ArrowRight className="h-3.5 w-3.5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Estado vacío */}
      {filteredCursos.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {searchTerm ? "No se encontraron cursos" : "Aún no estás inscrito en ningún curso"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {searchTerm
                ? "No hay cursos que coincidan con tu búsqueda. Intenta con otros términos."
                : "Explora nuestro catálogo de cursos y comienza tu aprendizaje."
              }
            </p>
          </div>
          {!searchTerm && (
            <Button asChild size="lg">
              <Link href="/cursos">
                Explorar cursos disponibles
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
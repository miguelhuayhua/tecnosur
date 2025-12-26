"use client"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Calendar, ArrowRight, Clock, GraduationCap, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { format } from "date-fns"
import { categorias, categoriasCursos, clases, cursos, edicionesCursos, inscripciones } from "@/prisma/generated"
import { es } from "date-fns/locale"
import { Status, StatusIndicator } from "@/components/ui/shadcn-io/status"
import { ButtonGroup } from "@/components/ui/button-group"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

interface Inscripcion extends inscripciones {
  edicion: edicionesCursos & ({ curso: cursos & { categorias: Array<{ categoria: categorias }> }; clases: Array<clases> })

}


export function CursosGrid({ inscripciones }: { inscripciones: Inscripcion[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInscripciones = inscripciones.filter(inscripcion => {
    return inscripcion.edicion.curso.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  })


  return (
    <div className="space-y-6 mt-8">
      {/* Header con búsqueda */}

      <InputGroup className="max-w-md">
        <InputGroupInput
          placeholder="Buscar en mis cursos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} />
        <InputGroupAddon align={'inline-start'}>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align={'inline-end'}>
          <Badge className="rounded-full" variant={'secondary'}>
            {filteredInscripciones.length}
          </Badge>
        </InputGroupAddon>
      </InputGroup>


      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredInscripciones.map((inscripcion) => {
          const totalClases = inscripcion.edicion.clases?.length || 0
          const curso = inscripcion.edicion.curso;
          const edicion = inscripcion.edicion;
          return (
            <Card className="relative"
              key={edicion.id}
            >
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
                      {inscripcion.edicion.codigo}
                    </Badge>

                  </div>
                </div>
                {/* Horarios */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 ">
                    <Calendar className='size-4 text-muted-foreground'></Calendar>
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
                    {curso.enVivo ? "En vivo" : "Grabada"}
                  </Status>
                </div>

              </CardContent>
              <CardFooter>
                <ButtonGroup className="w-full">
                  <Button asChild className="flex-1" size="sm">
                    <Link href={`/dashboard/cursos/${edicion.id}`}>
                      Ir al curso
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button asChild className="bg-yellow-500" variant={'default'} size="sm">
                    <Link href={`/dashboard/cursos/${edicion.id}/calificar`}>
                      <Star />
                    </Link>
                  </Button>
                </ButtonGroup>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Estado vacío */}
      {filteredInscripciones.length === 0 && (
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
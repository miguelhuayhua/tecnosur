"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, FileText, Calendar, Award, Download, Eye, BookOpen, Link2, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

interface Certificado {
  id: string;
  codigoUnico: string;
  fechaEmision: Date;
  notaFinal?: number;
  urlCertificado?: string;
  curso: {
    id: string;
    titulo: string;
    descripcion: string;
    urlMiniatura?: string | null;
  };
  edicion: {
    codigo: string;
    fechaInicio: Date;
    fechaFin: Date;
    notaMinima: number;
  };
}

interface CertificadosGridProps {
  certificados: Certificado[];
}

export function CertificadosGrid({ certificados }: CertificadosGridProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCertificados = certificados.filter(certificado => {
    return certificado.curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificado.codigoUnico.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const formatFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(fecha));
  }

  const getEstadoCertificado = (certificado: Certificado) => {
    if (!certificado.notaFinal) return "pendiente";
    return certificado.notaFinal >= certificado.edicion.notaMinima ? "aprobado" : "reprobado";
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Header con búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar certificados por curso o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredCertificados.length} de {certificados.length} certificados
        </div>
      </div>

      {/* Grid de certificados */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCertificados.map((certificado) => {
          const estado = getEstadoCertificado(certificado)

          return (
            <Card key={certificado.id} className="overflow-hidden py-0 hover:shadow-md transition-shadow relative">
              {/* Imagen de portada del curso */}
              <div className="relative h-32 w-full">
                {certificado.curso.urlMiniatura ? (
                  <Image
                    src={certificado.curso.urlMiniatura}
                    alt={certificado.curso.titulo}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                    <Award className="h-12 w-12 text-green-500/50" />
                  </div>
                )}

                {/* Badges en esquina superior derecha */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {/* Badge de estado */}
                  <Badge className={
                    estado === "aprobado" ? "bg-green-500 text-white" :
                      estado === "reprobado" ? "bg-red-500 text-white" :
                        "bg-yellow-500 text-white"
                  }>
                    {estado === "aprobado" ? "Aprobado" :
                      estado === "reprobado" ? "Reprobado" : "Pendiente"}
                  </Badge>

                  {/* Badge de edición */}
                  <Badge variant="secondary" className="bg-white/90 text-gray-700">
                    {certificado.edicion.codigo}
                  </Badge>
                </div>
              </div>

              <CardContent >
                {/* Código del certificado */}
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {certificado.codigoUnico}
                  </code>
                </div>

                {/* Título del curso */}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  <Link
                    href={`/dashboard/cursos/${certificado.curso.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {certificado.curso.titulo}
                  </Link>
                </h3>

                {/* Nota final si existe */}
                {certificado.notaFinal && (
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Nota Final: <span className={
                        certificado.notaFinal >= certificado.edicion.notaMinima ? "text-green-600" : "text-red-600"
                      }>{certificado.notaFinal}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        (Mín: {certificado.edicion.notaMinima})
                      </span>
                    </span>
                  </div>
                )}

                {/* Fechas */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Emisión:</div>
                      <div className="text-muted-foreground">{formatFecha(certificado.fechaEmision)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Curso:</div>
                      <div className="text-muted-foreground">
                        {formatFecha(certificado.edicion.fechaInicio)} - {formatFecha(certificado.edicion.fechaFin)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Botones de acción */}
              <CardFooter >
                <div className="flex gap-2 w-full">
                  {certificado.urlCertificado ? (
                    <>
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/dashboard/certificados/${certificado.id}`} >
                          <Eye className="h-4 w-4 mr-2" />
                          Más información
                        </Link>
                      </Button>
                      <Button asChild variant={'secondary'} className="flex-1">
                        <Link href={certificado.urlCertificado} >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <FileText className="h-4 w-4 mr-2" />
                      Certificado no disponible
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Estado vacío */}
      {filteredCertificados.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Award className="h-10 w-10 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {searchTerm ? "No se encontraron certificados" : "Aún no tienes certificados"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm
                ? "No hay certificados que coincidan con tu búsqueda."
                : "Completa cursos para obtener certificados de finalización."
              }
            </p>
          </div>
          {!searchTerm && (
            <Button asChild size="lg" >
              <Link href="/dashboard/cursos">
                <BookOpen className="h-4 w-4 mr-2" />
                Ver mis cursos
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Award, BarChart3, CheckCircle, XCircle, Search, Calendar, Clock, FileText, Filter } from "lucide-react"
import Link from "next/link"

interface CalificacionData {
    curso: {
        titulo: string
        descripcion: string
        edicionCodigo: string
    }
    configuracionEdicion: {
        notaMinima: number
        notaMaxima: number
    }
    examenes: {
        id: string
        titulo: string
        descripcion?: string
        fechaDisponible: Date
        fechaLimite: Date
        notaMaxima: number
        notaMinima: number
        calificacion: {
            id: string
            nota: number
            notaNormalizada: number
            aprobado: boolean
            fechaPresentado: Date
            comentarios?: string
        } | null
    }[]
    estadisticas: {
        totalExamenes: number
        totalCalificados: number
        promedio: number
        aprobados: number
        reprobados: number
        porcentajeAprobacion: number
        notaMinimaEdicion: number
        notaMaximaEdicion: number
    }
}

interface CalificacionesClientProps {
    data: CalificacionData
    edicionId: string
}

export function CalificacionesClient({ data, edicionId }: CalificacionesClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterEstado, setFilterEstado] = useState<"todos" | "aprobados" | "reprobados" | "pendientes">("todos")

    // Función para normalizar notas (versión cliente por si acaso)
    const normalizarNota = useMemo(() => (
        nota: number, 
        notaMinimaExamen: number, 
        notaMaximaExamen: number
    ) => {
        const porcentaje = (nota - notaMinimaExamen) / (notaMaximaExamen - notaMinimaExamen);
        const notaNormalizada = porcentaje * (data.configuracionEdicion.notaMaxima - data.configuracionEdicion.notaMinima) + data.configuracionEdicion.notaMinima;
        
        return Math.max(
            data.configuracionEdicion.notaMinima, 
            Math.min(data.configuracionEdicion.notaMaxima, notaNormalizada)
        );
    }, [data.configuracionEdicion])

    const filteredExamenes = data.examenes.filter(examen => {
        const matchesSearch = examen.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (examen.descripcion && examen.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))

        if (filterEstado === "aprobados") {
            return matchesSearch && examen.calificacion?.aprobado
        } else if (filterEstado === "reprobados") {
            return matchesSearch && examen.calificacion && !examen.calificacion.aprobado
        } else if (filterEstado === "pendientes") {
            return matchesSearch && !examen.calificacion
        }

        return matchesSearch
    })

    const formatFecha = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-BO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(fecha))
    }

    const formatHora = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-BO', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(fecha))
    }

    const getEstadoExamen = (examen: CalificacionData["examenes"][0]) => {
        if (!examen.calificacion) {
            const ahora = new Date()
            const disponible = new Date(examen.fechaDisponible)
            const limite = new Date(examen.fechaLimite)

            if (ahora < disponible) return { estado: "Próximo", color: "blue" }
            if (ahora > limite) return { estado: "Finalizado", color: "gray" }
            return { estado: "Disponible", color: "green" }
        }

        return examen.calificacion.aprobado
            ? { estado: "Aprobado", color: "green" }
            : { estado: "Reprobado", color: "red" }
    }

    const getColorNota = (nota: number) => {
        if (nota >= data.configuracionEdicion.notaMinima) {
            return "text-green-600"
        } else if (nota >= data.configuracionEdicion.notaMinima * 0.7) {
            return "text-yellow-600"
        } else {
            return "text-red-600"
        }
    }

    return (
        <div className="space-y-6 mt-8">
            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{data.estadisticas.totalExamenes}</div>
                        <div className="text-sm text-muted-foreground">Total Exámenes</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{data.estadisticas.totalCalificados}</div>
                        <div className="text-sm text-muted-foreground">Calificados</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{data.estadisticas.promedio.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Promedio</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600">{data.estadisticas.aprobados}</div>
                        <div className="text-sm text-muted-foreground">Aprobados</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{data.estadisticas.porcentajeAprobacion.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">% Aprobación</div>
                    </CardContent>
                </Card>
            </div>

            {/* Resumen de rendimiento */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Resumen de Rendimiento
                    </CardTitle>
                    <CardDescription>
                        Estadísticas generales de tu desempeño en el curso (notas normalizadas)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Progreso de calificaciones:</span>
                                <span className="text-sm font-bold">{data.estadisticas.totalCalificados}/{data.estadisticas.totalExamenes}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(data.estadisticas.totalCalificados / data.estadisticas.totalExamenes) * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Tasa de aprobación:</span>
                                <span className="text-sm font-bold">{data.estadisticas.porcentajeAprobacion.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${data.estadisticas.porcentajeAprobacion}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium">Escala de evaluación:</span>
                                <span className="font-bold">
                                    {data.configuracionEdicion.notaMinima} - {data.configuracionEdicion.notaMaxima}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <span className="text-sm font-medium">Exámenes Aprobados</span>
                                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                    {data.estadisticas.aprobados}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <span className="text-sm font-medium">Exámenes Reprobados</span>
                                <Badge variant="default" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                                    {data.estadisticas.reprobados}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <span className="text-sm font-medium">Pendientes por calificar</span>
                                <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                    {data.estadisticas.totalExamenes - data.estadisticas.totalCalificados}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <span className="text-sm font-medium">Promedio General</span>
                                <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
                                    {data.estadisticas.promedio.toFixed(1)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Buscar exámenes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={filterEstado === "todos" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterEstado("todos")}
                                className="flex items-center gap-1"
                            >
                                <Filter className="h-3 w-3" />
                                Todos
                            </Button>
                            <Button
                                variant={filterEstado === "aprobados" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterEstado("aprobados")}
                                className="flex items-center gap-1"
                            >
                                <CheckCircle className="h-3 w-3" />
                                Aprobados
                            </Button>
                            <Button
                                variant={filterEstado === "reprobados" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterEstado("reprobados")}
                                className="flex items-center gap-1"
                            >
                                <XCircle className="h-3 w-3" />
                                Reprobados
                            </Button>
                            <Button
                                variant={filterEstado === "pendientes" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterEstado("pendientes")}
                                className="flex items-center gap-1"
                            >
                                <Clock className="h-3 w-3" />
                                Pendientes
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de calificaciones */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalle de Calificaciones</CardTitle>
                    <CardDescription>
                        Lista completa de todos los exámenes del curso con sus calificaciones normalizadas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Examen</TableHead>
                                <TableHead>Fechas</TableHead>
                                <TableHead>Escala Original</TableHead>
                                <TableHead>Tu Calificación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExamenes.map((examen) => {
                                const estado = getEstadoExamen(examen)

                                return (
                                    <TableRow key={examen.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-semibold flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    {examen.titulo}
                                                </div>
                                                {examen.descripcion && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {examen.descripcion}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Desde: {formatFecha(examen.fechaDisponible)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Hasta: {formatFecha(examen.fechaLimite)}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">{examen.notaMinima}-{examen.notaMaxima}</div>
                                                <div className="text-muted-foreground text-xs">
                                                    Escala examen
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {examen.calificacion ? (
                                                <div className="space-y-1">
                                                    <div className={`flex items-center gap-2 ${getColorNota(examen.calificacion.notaNormalizada)}`}>
                                                        <Award className="h-4 w-4" />
                                                        <span className="font-bold text-lg">
                                                            {examen.calificacion.notaNormalizada.toFixed(1)}
                                                        </span>
                                                        {examen.calificacion.aprobado ? (
                                                            <CheckCircle className="h-4 w-4" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Original: {examen.calificacion.nota.toFixed(1)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={
                                                    estado.color === "green" ? "default" :
                                                        estado.color === "red" ? "destructive" :
                                                            estado.color === "blue" ? "secondary" : "outline"
                                                }
                                            >
                                                {estado.estado}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/dashboard/examenes/${examen.id}`}>
                                                    Ver Detalles
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>

                    {/* Estado vacío */}
                    {filteredExamenes.length === 0 && (
                        <div className="text-center py-8">
                            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm || filterEstado !== "todos"
                                    ? "No se encontraron exámenes que coincidan con los filtros"
                                    : "No hay exámenes registrados en este curso"
                                }
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
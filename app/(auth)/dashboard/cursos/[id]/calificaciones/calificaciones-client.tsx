'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Award,
    BarChart3,
    CheckCircle,
    XCircle,
    Search,
    Calendar,
    Clock,
    FileText,
    Filter,
    TrendingUp,
    AlertCircle,
    Users,
    ChevronRight,
    BookOpen
} from "lucide-react"

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

    const filteredExamenes = useMemo(() => 
        data.examenes.filter(examen => {
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
    , [data.examenes, searchTerm, filterEstado])

    const formatFecha = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-BO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(fecha))
    }

    const getEstadoExamen = (examen: CalificacionData["examenes"][0]) => {
        if (!examen.calificacion) {
            const ahora = new Date()
            const disponible = new Date(examen.fechaDisponible)
            const limite = new Date(examen.fechaLimite)

            if (ahora < disponible) return { estado: "Próximo", color: "secondary" }
            if (ahora > limite) return { estado: "Finalizado", color: "outline" }
            return { estado: "Disponible", color: "default" }
        }

        return examen.calificacion.aprobado
            ? { estado: "Aprobado", color: "default" }
            : { estado: "Reprobado", color: "destructive" }
    }

    const getColorNota = (nota: number) => {
        if (nota >= data.configuracionEdicion.notaMinima) {
            return "text-green-600 dark:text-green-400"
        } else if (nota >= data.configuracionEdicion.notaMinima * 0.7) {
            return "text-yellow-600 dark:text-yellow-400"
        } else {
            return "text-red-600 dark:text-red-400"
        }
    }

    return (
        <div className="space-y-6 mt-8">
            {/* Header con navegación */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Calificaciones</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link
                        href={`/dashboard/cursos`}
                        className="hover:text-foreground transition-colors"
                    >
                        Cursos
                    </Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="truncate">{data.curso.titulo}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span className="font-medium">Edición {data.curso.edicionCodigo}</span>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {data.estadisticas.totalExamenes}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Exámenes</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {data.estadisticas.totalCalificados}
                        </div>
                        <div className="text-sm text-muted-foreground">Calificados</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {data.estadisticas.promedio.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">Promedio</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {data.estadisticas.aprobados}
                        </div>
                        <div className="text-sm text-muted-foreground">Aprobados</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {data.estadisticas.porcentajeAprobacion.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">% Aprobación</div>
                    </CardContent>
                </Card>
            </div>

            {/* Información del curso y resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Información del Curso
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">{data.curso.titulo}</h3>
                                {data.curso.descripcion && (
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {data.curso.descripcion}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-xs text-muted-foreground">Escala de evaluación</div>
                                    <div className="font-bold">
                                        {data.configuracionEdicion.notaMinima} - {data.configuracionEdicion.notaMaxima}
                                    </div>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                    <div className="text-xs text-muted-foreground">Código de edición</div>
                                    <div className="font-bold">{data.curso.edicionCodigo}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Resumen
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm">Progreso:</span>
                                <span className="text-sm font-medium">
                                    {data.estadisticas.totalCalificados}/{data.estadisticas.totalExamenes}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(data.estadisticas.totalCalificados / data.estadisticas.totalExamenes) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm">Tasa de aprobación:</span>
                                <span className="text-sm font-medium">
                                    {data.estadisticas.porcentajeAprobacion.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${data.estadisticas.porcentajeAprobacion}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Buscar por título o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={filterEstado}
                                onValueChange={(value: "todos" | "aprobados" | "reprobados" | "pendientes") => 
                                    setFilterEstado(value)
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            Todos los estados
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="aprobados">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Aprobados
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="reprobados">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Reprobados
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="pendientes">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Pendientes
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {(searchTerm || filterEstado !== "todos") && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setFilterEstado("todos")
                                    }}
                                    title="Limpiar filtros"
                                >
                                    <Filter className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de calificaciones */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Calificaciones de Exámenes</CardTitle>
                            <CardDescription>
                                Detalle completo de todos los exámenes con sus calificaciones
                            </CardDescription>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Mostrando {filteredExamenes.length} de {data.examenes.length} exámenes
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredExamenes.length === 0 ? (
                        <div className="text-center py-12">
                            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">
                                {searchTerm || filterEstado !== "todos"
                                    ? "No se encontraron resultados"
                                    : "No hay exámenes registrados"
                                }
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm || filterEstado !== "todos"
                                    ? "Intenta con otros términos de búsqueda o filtros"
                                    : "No se han registrado exámenes para este curso"
                                }
                            </p>
                            {(searchTerm || filterEstado !== "todos") && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setFilterEstado("todos")
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Examen</TableHead>
                                        <TableHead>Fechas</TableHead>
                                        <TableHead className="text-center">Escala</TableHead>
                                        <TableHead className="text-center">Calificación</TableHead>
                                        <TableHead className="text-center">Estado</TableHead>
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
                                                            <span>{formatFecha(examen.fechaDisponible)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{formatFecha(examen.fechaLimite)}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="text-sm">
                                                        <div className="font-medium">{examen.notaMinima}-{examen.notaMaxima}</div>
                                                        <div className="text-muted-foreground text-xs">
                                                            Escala original
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {examen.calificacion ? (
                                                        <div className="space-y-1">
                                                            <div className={`flex items-center justify-center gap-2 ${getColorNota(examen.calificacion.notaNormalizada)}`}>
                                                                <Award className="h-4 w-4" />
                                                                <span className="font-bold text-lg">
                                                                    {examen.calificacion.notaNormalizada.toFixed(1)}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Original: {examen.calificacion.nota.toFixed(1)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={estado.color as any}
                                                        className={
                                                            estado.color === "default" && estado.estado === "Disponible"
                                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                                : undefined
                                                        }
                                                    >
                                                        {estado.estado}
                                                    </Badge>
                                                </TableCell>
                                              
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                {filteredExamenes.length > 0 && filteredExamenes.length < data.examenes.length && (
                    <CardFooter>
                        <div className="flex items-center justify-between w-full text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Filter className="h-4 w-4" />
                                Filtros aplicados
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm("")
                                    setFilterEstado("todos")
                                }}
                            >
                                Mostrar todos
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
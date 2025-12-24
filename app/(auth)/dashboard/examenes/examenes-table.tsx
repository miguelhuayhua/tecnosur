"use client"

import { useState, useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
    Search,
    Eye,
    Calendar,
    Clock,
    Award,
    BookOpen,
    FileText,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Clock4,
    Filter,
    Download,
    Users
} from "lucide-react"
import Link from "next/link"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ButtonGroup } from "@/components/ui/button-group"

interface Examen {
    id: string;
    titulo: string;
    descripcion?: string;
    fechaDisponible: Date;
    fechaLimite: Date;
    notaMaxima: number;
    notaMinima: number;
    calificacion: {
        id: string;
        nota: number;
        aprobado: boolean;
        fechaPresentado?: Date;
    } | null;
    curso: {
        id: string;
        titulo: string;
    };
    edicionId: string;
}

interface ExamenesTableProps {
    examenes: Examen[];
}

export function ExamenesTable({ examenes }: ExamenesTableProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterEstado, setFilterEstado] = useState<'all' | 'disponible' | 'proximo' | 'finalizado' | 'calificado'>('all')

    const filteredExamenes = useMemo(() => {
        let filtered = examenes.filter(examen =>
            examen.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            examen.curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (examen.descripcion && examen.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
        )

        if (filterEstado !== 'all') {
            filtered = filtered.filter(examen => {
                const estado = getEstadoExamen(examen)
                return estado.estado === filterEstado
            })
        }

        return filtered
    }, [examenes, searchTerm, filterEstado])

 

    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('es-BO', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    const getEstadoExamen = (examen: Examen) => {
        const ahora = new Date();
        const disponible = new Date(examen.fechaDisponible);
        const limite = new Date(examen.fechaLimite);

        if (ahora < disponible) {
            return { estado: "proximo", variant: "outline" as const, icon: Clock4, color: "text-yellow-500 border-yellow-500" };
        }
        if (ahora > limite) {
            return { estado: "finalizado", variant: "outline" as const, icon: AlertCircle, color: "text-gray-500 border-gray-500" };
        }
        if (examen.calificacion) {
            return {
                estado: "calificado",
                variant: examen.calificacion.aprobado ? "default" : "destructive" as const,
                icon: CheckCircle,
                color: examen.calificacion.aprobado ? "text-green-500" : "text-red-500"
            };
        }
        return { estado: "disponible", variant: "default" as const, icon: CheckCircle, color: "text-green-500" };
    }

    const getEstadoFilterLabel = () => {
        switch (filterEstado) {
            case 'disponible': return 'Disponibles'
            case 'proximo': return 'Próximos'
            case 'finalizado': return 'Finalizados'
            case 'calificado': return 'Calificados'
            default: return 'Todos'
        }
    }

    // Estadísticas
    const estadisticas = useMemo(() => {
        const ahora = new Date()
        return {
            total: examenes.length,
            disponibles: examenes.filter(e => {
                const estado = getEstadoExamen(e)
                return estado.estado === 'disponible'
            }).length,
            proximos: examenes.filter(e => {
                const estado = getEstadoExamen(e)
                return estado.estado === 'proximo'
            }).length,
            calificados: examenes.filter(e => e.calificacion).length,
            aprobados: examenes.filter(e => e.calificacion?.aprobado).length,
            cursosUnicos: Array.from(new Set(examenes.map(e => e.curso.id))).length,
            promedioNotas: examenes.filter(e => e.calificacion)
                .reduce((acc, e) => acc + (e.calificacion?.nota || 0), 0) /
                examenes.filter(e => e.calificacion).length || 0
        }
    }, [examenes])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className='flex justify-between items-start'>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <h1 className="text-xl font-semibold">
                                Mis Exámenes
                            </h1>
                            <Badge variant="secondary">
                                {examenes.length}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Gestiona y revisa todos tus exámenes
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-3">
                    <InputGroup className='max-w-md'>
                        <InputGroupAddon>
                            <Search className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="Buscar examen o curso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <InputGroupAddon align="inline-end">
                            {filteredExamenes.length} resultados
                        </InputGroupAddon>
                    </InputGroup>

                    <ButtonGroup>
                        <Button
                            variant={filterEstado === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterEstado('all')}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Todos
                        </Button>
                        <Button
                            variant={filterEstado === 'disponible' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterEstado('disponible')}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Disponibles
                        </Button>
                        <Button
                            variant={filterEstado === 'proximo' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterEstado('proximo')}
                        >
                            <Clock4 className="h-4 w-4 mr-2" />
                            Próximos
                        </Button>
                        <Button
                            variant={filterEstado === 'calificado' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterEstado('calificado')}
                        >
                            <Award className="h-4 w-4 mr-2" />
                            Calificados
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 rounded-md bg-muted">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-medium">{estadisticas.total}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 rounded-md bg-muted">
                        <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Disponibles</div>
                        <div className="font-medium">{estadisticas.disponibles}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 rounded-md bg-muted">
                        <Award className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Calificados</div>
                        <div className="font-medium">{estadisticas.calificados}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 rounded-md bg-muted">
                        <Users className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Cursos</div>
                        <div className="font-medium">{estadisticas.cursosUnicos}</div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <ScrollArea className="h-[500px]">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Examen</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead>Curso</TableHead>
                            <TableHead>Notas</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExamenes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {searchTerm || filterEstado !== 'all'
                                                ? 'No se encontraron exámenes que coincidan con los filtros'
                                                : 'No tienes exámenes asignados'
                                            }
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredExamenes.map((examen) => {
                                const estado = getEstadoExamen(examen)
                                const EstadoIcon = estado.icon

                                return (
                                    <TableRow key={examen.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Link
                                                    href={`/dashboard/examenes/${examen.id}`}
                                                    className="font-medium hover:text-blue-600 transition-colors line-clamp-2"
                                                >
                                                    {examen.titulo}
                                                </Link>
                                                {examen.descripcion && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {examen.descripcion}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">Desde:</span>
                                                </div>
                                                <div>{formatDateTime(examen.fechaDisponible)}</div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">Hasta:</span>
                                                </div>
                                                <div>{formatDateTime(examen.fechaLimite)}</div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Link
                                                href={`/dashboard/cursos/${examen.edicionId}`}
                                                className="flex items-center gap-1 text-sm hover:text-blue-600 transition-colors"
                                            >
                                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                                <span className="line-clamp-2">{examen.curso.titulo}</span>
                                                <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Award className="h-3 w-3 text-muted-foreground" />
                                                    <span>{examen.notaMaxima} max</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Award className="h-3 w-3 text-muted-foreground" />
                                                    <span>{examen.notaMinima} min</span>
                                                </div>
                                                {examen.calificacion && (
                                                    <div className={`flex items-center gap-1 mt-1 ${examen.calificacion.aprobado ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        <Award className="h-3 w-3" />
                                                        <span className="font-medium">
                                                            {examen.calificacion.nota}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <Badge
                                                variant={'outline'}
                                                className={estado.color}
                                            >
                                                <EstadoIcon className="h-3 w-3 mr-1" />
                                                {estado.estado.charAt(0).toUpperCase() + estado.estado.slice(1)}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon">
                                                    <Link href={`/dashboard/examenes/${examen.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {examen.calificacion && (
                                                    <Button variant="ghost" size="icon">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={6}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                    <div className="text-xs text-muted-foreground">
                                        Mostrando {filteredExamenes.length} de {examenes.length} exámenes
                                        {searchTerm && ` para "${searchTerm}"`}
                                        {filterEstado !== 'all' && ` • ${getEstadoFilterLabel()}`}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <div className="flex flex-wrap gap-3">
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" />
                                                {estadisticas.disponibles} disponibles
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Award className="h-3 w-3" />
                                                {estadisticas.aprobados} aprobados
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {estadisticas.cursosUnicos} cursos
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
                <ScrollBar orientation='horizontal' />
            </ScrollArea>
        </div>
    )
}
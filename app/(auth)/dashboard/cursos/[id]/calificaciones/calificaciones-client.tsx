'use client'

import { Badge } from "@/components/ui/badge"

import {
    Award,
    ChartArea,
    BookCheck,
    Table
} from "lucide-react"
import { calificaciones, edicionesCursos, examenes, inscripciones } from "@/prisma/generated"
import React from "react"
import { parseAsString, useQueryState } from "nuqs"
import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { formatDateTime } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDataTable } from '@/hooks/use-data-table'
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { BarChartData, DoubleBarChartData, Stat } from "@/config/charts"
import Stats from "./(.charts)/stats"
import { Charts } from "./(.charts)/charts"

interface Inscripcion extends inscripciones {
    edicion: edicionesCursos & {
        curso: { titulo: string },
        examenes: Array<examenes & { calificaciones: Array<calificaciones> }>
    }

}
export function CalificacionesClient({ inscripcion, charts, stats }: {
    inscripcion: Inscripcion,
    stats: Stat[],
    charts: {
        doublebarchart: DoubleBarChartData[],
        barchart: BarChartData[]
    }
}) {
    const edicion = inscripcion.edicion;
    const [examenSearch] = useQueryState("examen", parseAsString.withDefault(""))
    const filteredExamenes = React.useMemo(() => {
        return edicion.examenes.filter((examen) => {
            // Filtro por búsqueda
            const matchesSearch = examenSearch == "" ||
                examen.titulo.toLowerCase().includes(examenSearch.toLowerCase())
            return matchesSearch
        })
    }, [edicion, examenSearch])


    // Columnas para Exámenes
    const examenesColumns = React.useMemo<ColumnDef<examenes & { calificaciones: Array<calificaciones> }>[]>(() => [
        {
            id: "examen",
            accessorKey: "titulo",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} label="Examen" />
            ),
            cell: ({ row }) => {
                const examen = row.original
                return (
                    <>
                        <div className="font-medium">{examen.titulo}</div>
                        {examen.descripcion && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                                {examen.descripcion}
                            </div>
                        )}
                    </>
                )
            },
            meta: {
                label: "Examen",
                placeholder: "Buscar examen...",
                variant: "text",
            },
            enableColumnFilter: true,
        },
        {
            id: "Periodo",
            accessorFn: (row) => `${formatDateTime(row.fechaDisponible)} - ${formatDateTime(row.fechaLimite)}`,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} label="Período" />
            ),
            cell: ({ row }) => {
                const examen = row.original
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-muted-foreground">Desde: {formatDateTime(examen.fechaDisponible)}</span>
                        <span className="text-muted-foreground">Hasta: {formatDateTime(examen.fechaLimite)}</span>
                    </div>
                )
            },
        },
        {
            id: "calificacion",
            accessorFn: (row) => row.calificaciones.length,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} label="Mi Calificación" />
            ),
            cell: ({ row }) => {
                const calificacion = row.original.calificaciones.at(0)
                return (
                    <>
                        {calificacion ? (
                            <div className={`flex items-center gap-1`}>
                                <Award className="h-4 w-4" />
                                <span className="font-bold text-lg">
                                    {calificacion.nota.toFixed(1)}
                                </span>
                            </div>

                        ) : (
                            <span className="text-muted-foreground">-</span>
                        )}
                    </>
                )
            },
        },

    ], [])
    const { table } = useDataTable({
        data: filteredExamenes,
        columns: examenesColumns,
        pageCount: Math.ceil(filteredExamenes.length / 10),
        initialState: { pagination: { pageSize: 10, pageIndex: 0 } },
        getRowId: (row) => row.id,
        enableSorting: true
    })


    const [mainTab, setMainTab] = React.useState('table')

    return (
        <div className="space-y-4 mt-4">
            <Tabs value={mainTab} onValueChange={setMainTab} >
                <TabsList >
                    <TabsTrigger value="table" >
                        <Table />
                        Información
                    </TabsTrigger>
                    <TabsTrigger value="charts" >
                        <ChartArea />
                        Gráficos
                    </TabsTrigger>
                </TabsList>
                {/* Tab Tabla */}
                <TabsContent value="table" >

                    <div className="flex  justify-between items-center gap-2  mt-2">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-semibold">
                                    {edicion.curso.titulo}
                                </h1>
                                <Badge variant={'outline'} >
                                    Edición: {edicion.codigo}
                                </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground flex flex-col sm:flex-row  gap-1 sm:gap-4">

                                <div className="flex items-center gap-1 ">
                                    <BookCheck className="h-4 w-4" />
                                    <span>Rango Notas: {edicion.notaMinima} - {edicion.notaMaxima}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <DataTable table={table}>
                        <DataTableToolbar table={table} />
                    </DataTable>
                </TabsContent>

                <TabsContent value="charts" >

                    <Stats stats={stats} />
                    <Charts {...charts} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
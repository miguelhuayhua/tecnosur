"use client"
import { Badge } from "@/components/ui/badge"
import {
    Award
} from "lucide-react"
import { calificaciones, examenes } from '@/prisma/generated'
import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import { formatDateTime } from '@/lib/utils'
import { useDataTable } from '@/hooks/use-data-table'
import { DataTable } from '@/components/data-table/data-table'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'

interface Examen extends examenes {
    calificaciones: Array<calificaciones>,
    edicion: { id: string, codigo: string, curso: { titulo: string } }
}


export function ExamenesTable({ examenes }: { examenes: Array<Examen> }) {

    const [cursoSearch] = useQueryState("curso", parseAsString.withDefault(""))
    const [examenSearch] = useQueryState("examen", parseAsString.withDefault(""))
    const [estadoOptions] = useQueryState("estado", parseAsArrayOf(parseAsString).withDefault([]))
    const filteredExamenes = React.useMemo(() => {
        return examenes.filter((examen) => {
            // Filtro por búsqueda
            const matchesSearch = examenSearch == "" ||
                examen.titulo.toLowerCase().includes(examenSearch.toLowerCase());
            const matchesCurso = cursoSearch == "" ||
                examen.edicion.curso.titulo.toLowerCase().includes(cursoSearch.toLowerCase());
            const matchesEstado = estadoOptions.length == 0 ||
                estadoOptions.includes("s-c") ? (estadoOptions.length > 1 ? (estadoOptions.map(Boolean).includes(examen.calificaciones.at(0)?.aprobado!)) : (examen.calificaciones.length == 0)) : (estadoOptions.map(Boolean).includes(examen.calificaciones.at(0)?.aprobado!))
            return matchesSearch && matchesCurso && matchesEstado
        })
    }, [examenes, examenSearch])


    // Columnas para Exámenes
    const examenesColumns = React.useMemo<ColumnDef<Examen>[]>(() => [
        {
            id: "curso",
            accessorKey: "edicionId",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} label="Curso" />
            ),
            cell: ({ row }) => {
                const curso = row.original.edicion.curso;
                return (
                    <>
                        <p className="font-medium">{curso.titulo}</p>
                        <Badge>
                            Edición: {row.original.edicion.codigo}
                        </Badge>
                    </>
                )
            },
            meta: {
                label: "Curso",
                placeholder: "Buscar curso...",
                variant: "text",
            },
            enableColumnFilter: true,
        },
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
            id: "estado",
            accessorFn: (row) => `${formatDateTime(row.fechaDisponible)} - ${formatDateTime(row.fechaLimite)}`,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} label="Estado" />
            ),
            cell: ({ row }) => {
                const calificacion = row.original.calificaciones.at(0)

                return <Badge>{calificacion ? calificacion.aprobado ? "Aprobado" : "Reprobado" : "Sin calificar"}</Badge>
            },
            meta: {
                label: "Estado",
                variant: "multiSelect",
                options: [{
                    label: "Aprobado", value: "true",
                },
                { label: "Reprobado", value: "false" },
                { label: "Sin Calificar", value: "s-c" }
                ]
            },
            enableColumnFilter: true
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
            meta: { label: "Calificación" }
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
    return (

        <div>
            <DataTable table={table}>
                <DataTableToolbar table={table} />
            </DataTable>
        </div>

    )
}
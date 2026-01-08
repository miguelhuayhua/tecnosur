"use client"

import { Bar, BarChart, CartesianGrid, Label, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { BarChartData, DoubleBarChartData } from "@/config/charts"


interface Props {
    doublebarchart: DoubleBarChartData[]
    barchart: BarChartData[]
}


const barChartConfig = {
    "0-20": {
        color: "var(--chart-1)",
        label: "Del 0 - 20"
    },
    "21-40": {
        color: "var(--chart-2)",
        label: "Del 21 al 40"
    },
    "41-50": {
        color: "var(--chart-3)",
        label: "Del 41 al 50"
    },
    "51-60": {
        color: "var(--chart-4)",
        label: "Del 51 al 60"
    },
    "61-80": {
        color: "var(--chart-5)",
        label: "Del 61 al 80"
    },
    "81-100": {
        color: "var(--chart-6)",
        label: "Del 81 - 100"
    }
} satisfies ChartConfig;


const doubleBarChartConfig = {
    name: {
        label: "Exámen",
    },
    value: {
        label: "Mi Nota",
    },
    value2: {
        label: "Promedio Curso",
    }
} satisfies ChartConfig;

export function Charts({ barchart, doublebarchart }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Histograma de Calificaciones</CardTitle>
                    <CardDescription>Los cursos con mayor número de estudiantes inscritos</CardDescription>
                </CardHeader>
                <CardContent >
                    {barchart.length > 0 ? (
                        <ChartContainer config={barChartConfig}>

                            <BarChart
                                accessibilityLayer
                                data={barchart}

                            >

                                <CartesianGrid vertical={false} />

                                <XAxis
                                    type="category"
                                    dataKey="x"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    dataKey="y"
                                    type="number"
                                    hide
                                />

                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dashed" />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="y"
                                    name="Estudiantes"
                                    radius={[12, 12, 12, 12]}

                                />
                                <ChartLegend content={<ChartLegendContent />} />

                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px]">
                            <p className="text-muted-foreground">No hay datos de inscripciones disponibles</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                        Distribución de estudiantes por rango de calificaciones
                    </div>
                    <div className="text-muted-foreground leading-none">
                        Mostrando estudiantes inscritos por categoría de calificación
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Promedio de Notas Exámen</CardTitle>
                    <CardDescription>Las notas están normalizadas a una escala de 0-100</CardDescription>
                </CardHeader>
                <CardContent >
                    {doublebarchart.length > 0 ? (
                        <ChartContainer config={doubleBarChartConfig}>
                            <BarChart accessibilityLayer data={doublebarchart}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartLegend content={<ChartLegendContent />} />

                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dashed" />}
                                />
                                <Bar dataKey="value" fill="var(--chart-1)" radius={12} />
                                <Bar dataKey="value2" fill="var(--chart-2)" radius={12} />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px]">
                            <p className="text-muted-foreground">No hay datos de notas disponibles</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter >
                    <p className="flex gap-2 leading-none font-medium">
                        Comparativa de rendimiento académico
                    </p>
                    <p className="text-muted-foreground leading-none">
                        Mostrando tu nota vs promedio del curso en cada examen
                    </p>
                </CardFooter>
            </Card>


        </div>
    )
}
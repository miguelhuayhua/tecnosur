"use client";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Award, Calendar, FileText, ArrowRight, Users, BarChart3, CirclePercentIcon, ChartNoAxesCombinedIcon, TrendingUpIcon, BadgePercentIcon, DollarSignIcon, ShoppingBagIcon, ChevronRight } from "lucide-react";
import ListarCursos from "../../list";
import { BarChartData, PieChartData, Stat } from "@/lib/charts";
import { inscripciones } from "@/prisma/generated";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Label, Pie, PieChart } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";


const pieChartConfig = {
    ESPERA: {
        label: "ESPERA",
        color: "var(--chart-1)",

    },
    FINALIZADA: {
        label: "FINALIZADOS",
        color: "var(--chart-2)",
    },
    ACTIVA: {
        label: "EN PROGRESO",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

interface Props {
    piechart: PieChartData[],
    misCursos: inscripciones[],
    stats: Stat[],
    cursoActual: {
        cursoTitulo: string
        edicionId: string
        edicionCodigo: string

        // TUS DATOS
        miPromedio: number            // Tu promedio (60%)

        // COMPARATIVAS
        promedioCurso: number         // Promedio del curso (79%)
        mejorPromedio: number         // Mejor estudiante (98%)

        // POSICIÓN
        miPosicion: number            // Tu posición (2)
        totalEstudiantes: number      // Total inscritos (3)
        estudiantesConCalificaciones: number // Con notas (2)

        // DIFERENCIAS
        diferenciaConMejor: number    // 60 - 98 = -38pts
        diferenciaConPromedio: number // 60 - 79 = -19pts

        mensaje: string
    }
}

const salesChartConfig = {
    sales: {
        label: 'Sales'
    }
} satisfies ChartConfig


export default function DashboardClient({ piechart, misCursos, stats, cursoActual }: Props) {
    const { data: token } = useSession();
    const filledBars = Math.round(cursoActual.miPromedio / 3)
    const salesChartData = Array.from({ length: cursoActual.mejorPromedio / 3 }, (_, index) => {
        return {
            date: "",
            sales: index < filledBars ? 315 : 0
        }
    })
    return (
        <div className="space-y-8 mt-8">
            <Card >
                <CardContent className='space-y-4'>
                    <div className='grid gap-6 lg:grid-cols-5'>
                        <div className='flex flex-col gap-4 lg:col-span-3'>
                            <span className='text-lg font-semibold'>Bienvenido al panel de estudiante</span>
                           


                            <div className='grid gap-4 sm:grid-cols-2'>
                                {stats.map((stat, index) => (
                                    <div key={index} className='flex items-center gap-6 rounded-md px-4 py-2'>
                                        <span className="p-4 rounded-md bg-primary/5">
                                                {stat.icon}
                                            </span>
                                        <div className='flex flex-col gap-0.5'>
                                            <span className='text-muted-foreground text-sm font-medium'>{stat.titulo}</span>
                                            <span className='text-lg font-medium'>{stat.valor}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Card className='  shadow-none lg:col-span-2'>
                            <CardHeader className='gap-1'>
                                <CardTitle className='text-lg font-semibold'>
                                    Cursos Inscritos
                                </CardTitle>
                            </CardHeader>

                            <CardContent >
                                {
                                    piechart.every(value => !value.value) ?
                                        <div className="flex gap-3 flex-col items-center">
                                            <Image alt="buscar cursos" width={200} height={100} src={"/buscar-cursos.svg"} />
                                            <p className="text-muted-foreground">
                                                Parece que aún no estás inscrito en ningún curso
                                            </p>
                                        </div> :
                                        <ChartContainer config={pieChartConfig} >
                                            <PieChart >
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                                <ChartLegend
                                                    content={<ChartLegendContent nameKey="name" />}

                                                />
                                                <Pie
                                                    data={piechart}
                                                    dataKey='value'
                                                    nameKey='name'
                                                    startAngle={300}
                                                    endAngle={660}
                                                    innerRadius={58}
                                                    outerRadius={75}
                                                    paddingAngle={2}
                                                >
                                                    <Label
                                                        content={({ viewBox }) => {
                                                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                                                                return (
                                                                    <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                                                                        <tspan
                                                                            x={viewBox.cx}
                                                                            y={(viewBox.cy || 0) - 12}
                                                                            className='fill-card-foreground text-lg font-medium'
                                                                        >
                                                                            {
                                                                                piechart.reduce((suma, value) => suma + value.value, 0)
                                                                            }
                                                                        </tspan>
                                                                        <tspan
                                                                            x={viewBox.cx}
                                                                            y={(viewBox.cy || 0) + 19}
                                                                            className='fill-muted-foreground text-sm'
                                                                        >
                                                                            Total
                                                                        </tspan>
                                                                    </text>
                                                                )
                                                            }
                                                        }}
                                                    />
                                                </Pie>
                                            </PieChart>
                                        </ChartContainer>
                                }
                            </CardContent>
                            <CardFooter className="mt-auto">
                                <Button asChild variant={'secondary'} className="w-full">
                                    <Link href='/cursos' target="_blank">
                                        Buscar más Cursos
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    {
                        cursoActual.edicionCodigo && (
                            <>
                                <Separator />
                                <h3 className="text-center text-primary font-bold text-xl">
                                    Tu último curso
                                </h3>
                                <Card className='relative border-none shadow-none'>
                                    <CardContent className='grid gap-8 px-4 lg:grid-cols-5'>

                                        <div className='flex flex-col justify-center gap-5'>
                                            <span className='text-md font-bold text-center'>Mi Rendimiento sobre 100 pts</span>
                                            <span className='max-lg:2xl text-center font-bold text-5xl'>{cursoActual.miPromedio} pts</span>
                                            <span className='text-muted-foreground text-xs text-center'>Tu nivel de rendimiento comparado con estudiantes del curso</span>
                                        </div>
                                        <div className='flex flex-col gap-3 text-lg md:col-span-4'>

                                            <h2 className="space-x-2" >
                                                <span className="text-xl font-bold">
                                                    {cursoActual.cursoTitulo}
                                                </span>
                                                <Badge variant={'outline'}>
                                                    Edición: {cursoActual.edicionCodigo}
                                                </Badge>
                                            </h2>
                                            <Button className="w-25"
                                                variant={"secondary"} size={'sm'} asChild>
                                                <Link href={`/dashboard/cursos/${cursoActual.edicionId}/`}>
                                                    Ir al Curso <ChevronRight />
                                                </Link>
                                            </Button>
                                            <span className='text-muted-foreground text-sm text-wrap'>
                                                {cursoActual.mensaje}. Comparado con {cursoActual.totalEstudiantes} estudiantes inscritos con un promedio general de {cursoActual.promedioCurso}
                                            </span>
                                            <div className='grid gap-6 md:grid-cols-2'>
                                                <div className='flex items-center gap-2'>
                                                    <ChartNoAxesCombinedIcon className='size-6' />
                                                    <span className='text-lg font-medium'>Tu Posición: #{cursoActual.miPosicion}</span>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <CirclePercentIcon className='size-6' />
                                                    <span className='text-lg font-medium'>Rendimiento Mejor Estudiante {cursoActual.mejorPromedio} pts</span>
                                                </div>
                                            </div>

                                            <ChartContainer config={salesChartConfig} className='h-7.75 w-full'>
                                                <BarChart
                                                    accessibilityLayer
                                                    data={salesChartData}
                                                    maxBarSize={16}
                                                >
                                                    <Bar
                                                        dataKey='sales'
                                                        fill='var(--primary)'
                                                        background={{ fill: 'color-mix(in oklab, var(--primary) 10%, transparent)', radius: 12 }}
                                                        radius={12}
                                                    />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )
                    }
                </CardContent>
            </Card>
            <h3 className="font-semibold">
                Puede que estos cursos sean de tu interés
            </h3>
            <ListarCursos inscripciones={misCursos} />
            {/* Acciones rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Card className="pb-3">
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <BookOpen className="size-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Mis Cursos</h3>
                                <p className="text-sm text-muted-foreground">Ver todos mis cursos</p>
                            </div>
                            <Button asChild variant="ghost" size="icon">
                                <Link href="/dashboard/cursos">
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card className="pb-3">
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="size-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Exámenes</h3>
                                <p className="text-sm text-muted-foreground">Ver mis exámenes</p>
                            </div>
                            <Button size='sm' asChild variant="ghost" >
                                <Link href="/dashboard/examenes">
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>

                    </CardContent>
                </Card>
                <Card className="pb-3">
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Users className="size-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">Mi Cuenta</h3>
                                <p className="text-sm text-muted-foreground">Gestionar cuenta</p>
                            </div>
                            <Button size='sm' asChild variant="ghost" >
                                <Link href="/dashboard/cuenta">
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>


                    </CardContent>
                </Card>
            </div>


        </div>
    );
}
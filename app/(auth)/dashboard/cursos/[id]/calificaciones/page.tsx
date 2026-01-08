import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { CalificacionesClient } from "./calificaciones-client";
import { ContentLayout } from "@/components/dashboard/content-layout";
import { notFound } from "next/navigation";
import { BarChartData, DoubleBarChartData, Stat } from "@/config/charts";



async function getCalificacionesStats(
    edicionId: string,
    correo: string
): Promise<Stat[]> {

    const examenes = await prisma.examenes.findMany({
        where: { edicionId },
        select: {
            notaMaxima: true,
            notaMinima: true,
            calificaciones: {
                select: {
                    nota: true,
                    estudiante: {
                        select: {
                            usuario: {
                                select: { correo: true }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!examenes.length) return []

    let sumaPersonal = 0
    let sumaCurso = 0
    let countPersonal = 0
    let countCurso = 0
    let totalExamenes = examenes.length

    for (const examen of examenes) {
        const todas = examen.calificaciones

        // Promedio curso
        if (todas.length) {
            const avgCurso = todas.reduce((s, c) => s + c.nota, 0) / todas.length
            sumaCurso += (avgCurso / examen.notaMaxima) * 100
            countCurso++
        }

        // Nota del estudiante
        const calif = todas.find(
            c => c.estudiante?.usuario?.correo === correo
        )

        if (calif) {
            sumaPersonal += (calif.nota / examen.notaMaxima) * 100
            countPersonal++
        }
    }

    const promedioPersonal = countPersonal
        ? Number((sumaPersonal / countPersonal).toFixed(1))
        : 0

    const promedioCurso = countCurso
        ? Number((sumaCurso / countCurso).toFixed(1))
        : 0

    // Regla de estado (usamos nota mínima promedio normalizada)
    const notaMinimaNorm =
        examenes.reduce((s, e) => s + (e.notaMinima / e.notaMaxima) * 100, 0) /
        examenes.length

    const estado =
        promedioPersonal >= notaMinimaNorm
            ? "Aprobando"
            : promedioPersonal >= notaMinimaNorm * 0.9
                ? "En riesgo"
                : "Reprobando"

    return [
        {
            titulo: "Tu promedio",
            valor: promedioPersonal,
            badge: "Personal",
            descripcion: "Promedio normalizado sobre 100"
        },
        {
            titulo: "Promedio del curso",
            valor: promedioCurso,
            badge: "Referencia",
            descripcion: "Promedio general del curso"
        },
        {
            titulo: "Exámenes rendidos",
            valor: countPersonal,
            badge: "Progreso",
            descripcion: `Has rendido ${countPersonal} de ${totalExamenes} exámenes`
        },
        {
            titulo: "Estado actual",
            valor: promedioPersonal,
            badge: estado,
            descripcion: `Situación académica: ${estado}`
        }
    ]
}

async function getCursoHistogram(
    edicionId: string
): Promise<BarChartData[]> {

    const examenes = await prisma.examenes.findMany({
        where: { edicionId },
        select: {
            notaMaxima: true,
            calificaciones: {
                select: { nota: true }
            }
        }
    })

    if (!examenes.length) return []

    const rangos = [
        { min: 0, max: 20, label: "0-20" },
        { min: 21, max: 40, label: "21-40" },
        { min: 41, max: 50, label: "41-50" },
        { min: 51, max: 60, label: "51-60" },
        { min: 61, max: 80, label: "61-80" },
        { min: 81, max: 100, label: "81-100" }
    ]

    const notasNormalizadas: number[] = []

    for (const examen of examenes) {
        for (const c of examen.calificaciones) {
            const normalizada = (c.nota / examen.notaMaxima) * 100
            notasNormalizadas.push(normalizada)
        }
    }

    return rangos.map(r => ({
        x: r.label,
        y: notasNormalizadas.filter(n => n >= r.min && n <= r.max).length,
        fill: `var(--color-${r.label})`
    }))
}
async function getPromedioComparativoPorExamen(
    edicionId: string,
    correo: string
): Promise<DoubleBarChartData[]> {

    const examenes = await prisma.examenes.findMany({
        where: { edicionId },
        select: {
            titulo: true,
            notaMaxima: true,
            fechaDisponible: true,
            calificaciones: {
                select: {
                    nota: true,
                    estudiante: {
                        select: {
                            usuario: {
                                select: { correo: true }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            fechaDisponible: "asc"
        }
    })

    if (!examenes.length) return []

    return examenes.map(examen => {
        const todas = examen.calificaciones

        const promedioCurso = todas.length
            ? todas.reduce((s, c) => s + c.nota, 0) / todas.length
            : 0

        const calificacionEstudiante = todas.find(
            c => c.estudiante?.usuario?.correo === correo
        )

        const notaEstudiante = calificacionEstudiante?.nota ?? 0

        const promedioCursoNorm = examen.notaMaxima
            ? (promedioCurso / examen.notaMaxima) * 100
            : 0

        const promedioEstudianteNorm = examen.notaMaxima
            ? (notaEstudiante / examen.notaMaxima) * 100
            : 0

        return {
            name: examen.titulo,
            value: Number(promedioEstudianteNorm.toFixed(1)),
            value2: Number(promedioCursoNorm.toFixed(1)),
        }
    })
}

async function getCalificacionesCurso(edicionId: string, correo: string) {
    const inscripcion = await prisma.inscripciones.findFirst({
        where: {
            edicion: { id: edicionId },
            estudiante: {
                usuario: { correo }
            },
        },
        include: {
            edicion: {
                include: {
                    curso: {
                        select: {
                            titulo: true,
                        }
                    },
                    examenes: {
                        include: {
                            calificaciones: {
                                where: {
                                    estudiante: {
                                        usuario: { correo }
                                    }
                                },
                                take: 1
                            }
                        },
                        orderBy: {
                            fechaDisponible: 'asc'
                        }
                    }
                }
            }
        }
    });

    if (!inscripcion) return notFound();
    return inscripcion;
}
export default async function CalificacionesPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await getServerSession()
    const { id: edicionId } = await params

    if (!session?.user?.email) return notFound()

    const inscripcion = await getCalificacionesCurso(
        edicionId,
        session.user.email
    )

    const barchart = await getCursoHistogram(edicionId)
    const stats = await getCalificacionesStats(edicionId, session.user.email!);
    const doublebarchart = await getPromedioComparativoPorExamen(
        edicionId,
        session.user.email
    )

    return (
        <ContentLayout title={`Calificaciones - ${inscripcion.edicion.curso.titulo}`}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                       Dashboard
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/cursos">Mis Cursos</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href={`/dashboard/cursos/${inscripcion.edicionId}`}>
                                {inscripcion.edicion.curso.titulo}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Calificaciones</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <CalificacionesClient
                inscripcion={inscripcion}
                charts={{ doublebarchart, barchart }}
                stats={stats}
            />
        </ContentLayout>
    )
}

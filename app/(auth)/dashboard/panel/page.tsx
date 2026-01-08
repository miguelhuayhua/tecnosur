import Link from "next/link";
import { ContentLayout } from "@/components/dashboard/content-layout";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Award, Calendar, FileText, ArrowRight, Users, BarChart3, FolderPlus, Eye } from "lucide-react";
import DashboardClient from "./client";
import { notFound } from "next/navigation";
import { PieChartData, Stat } from "@/lib/charts";

async function getMisCursos(correo: string) {
    return await prisma.inscripciones.findMany({
        where: {
            estudiante: {
                usuario: {
                    correo
                }
            }
        }
    })
}
async function getCardInfoCursoActual(correo: string): Promise<{
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
}> {
    // 1. Buscar estudiante
    const usuario = await prisma.usuariosEstudiantes.findUnique({
        where: { correo },
        include: { estudiante: { select: { id: true } } }
    })

    if (!usuario?.estudiante) throw new Error('Estudiante no encontrado')
    const estudianteId = usuario.estudiante.id

    // 2. Buscar curso activo
    const inscripcion = await prisma.inscripciones.findFirst({
        where: {
            estudianteId,
            estado: true,
            edicion: { estado: 'ACTIVA' }
        },
        include: {
            edicion: {
                include: {
                    curso: { select: { titulo: true } },
                    _count: { select: { inscripciones: { where: { estado: true } } } }
                }
            }
        },
        orderBy: { inscritoEn: 'desc' }
    })

    if (!inscripcion) {
        return {
            cursoTitulo: 'Sin curso activo',
            edicionId: '',
            edicionCodigo: '',
            miPromedio: 0,
            promedioCurso: 0,
            mejorPromedio: 0,
            miPosicion: 0,
            totalEstudiantes: 0,
            estudiantesConCalificaciones: 0,
            diferenciaConMejor: 0,
            diferenciaConPromedio: 0,
            mensaje: 'No tienes cursos activos'
        }
    }

    const edicion = inscripcion.edicion

    // 3. Obtener todas las calificaciones
    const todasCalificaciones = await prisma.calificaciones.findMany({
        where: { examen: { edicionId: edicion.id } },
        include: { examen: { select: { notaMaxima: true } } }
    })

    // 4. Calcular promedios por estudiante (simple)
    const promedios = new Map<string, number[]>()

    todasCalificaciones.forEach(cal => {
        const notaMaxima = cal.examen.notaMaxima || 100
        const porcentaje = (cal.nota / notaMaxima) * 100

        const notas = promedios.get(cal.estudianteId) || []
        notas.push(Math.min(100, Math.max(0, porcentaje)))
        promedios.set(cal.estudianteId, notas)
    })

    // 5. Crear array de estudiantes con promedios
    const estudiantes: Array<{ id: string, promedio: number }> = []

    promedios.forEach((notas, id) => {
        const promedio = notas.reduce((a, b) => a + b, 0) / notas.length
        estudiantes.push({ id, promedio })
    })

    // Ordenar de mayor a menor
    estudiantes.sort((a, b) => b.promedio - a.promedio)

    // 6. Buscar mi posición
    const miIndex = estudiantes.findIndex(e => e.id === estudianteId)

    if (miIndex === -1 || estudiantes.length === 0) {
        return {
            cursoTitulo: edicion.curso.titulo,
            edicionId: edicion.id,
            edicionCodigo: edicion.codigo,
            miPromedio: 0,
            promedioCurso: 0,
            mejorPromedio: 0,
            miPosicion: 0,
            totalEstudiantes: edicion._count.inscripciones,
            estudiantesConCalificaciones: estudiantes.length,
            diferenciaConMejor: 0,
            diferenciaConPromedio: 0,
            mensaje: 'Aún no tienes calificaciones'
        }
    }

    // 7. Calcular estadísticas
    const miPromedio = estudiantes[miIndex].promedio
    const mejorPromedio = estudiantes[0].promedio

    const sumaPromedios = estudiantes.reduce((sum, e) => sum + e.promedio, 0)
    const promedioCurso = sumaPromedios / estudiantes.length

    const diferenciaConMejor = miPromedio - mejorPromedio
    const diferenciaConPromedio = miPromedio - promedioCurso

    // 8. Mensaje
    let mensaje = ''
    if (estudiantes.length === 1) {
        mensaje = 'Eres el único con calificaciones'
    } else if (miIndex === 0) {
        mensaje = 'Eres el mejor del curso'
    } else if (diferenciaConPromedio > 0) {
        mensaje = `Estás ${diferenciaConPromedio.toFixed(1)} pts sobre el promedio`
    } else {
        mensaje = `Estás ${Math.abs(diferenciaConPromedio).toFixed(1)} pts bajo el promedio`
    }

    // 9. Retornar
    return {
        cursoTitulo: edicion.curso.titulo,
        edicionId: edicion.id,
        edicionCodigo: edicion.codigo,
        miPromedio: Number(miPromedio.toFixed(1)),
        promedioCurso: Number(promedioCurso.toFixed(1)),
        mejorPromedio: Number(mejorPromedio.toFixed(1)),
        miPosicion: miIndex + 1,
        totalEstudiantes: edicion._count.inscripciones,
        estudiantesConCalificaciones: estudiantes.length,
        diferenciaConMejor: Number(diferenciaConMejor.toFixed(1)),
        diferenciaConPromedio: Number(diferenciaConPromedio.toFixed(1)),
        mensaje
    }
}
async function getBalanceFormacionPie(correo: string): Promise<PieChartData[]> {
    // Obtener todas las inscripciones del estudiante con estado de edición
    const inscripciones = await prisma.inscripciones.findMany({
        where: {
            estudiante: {
                usuario: { correo }
            }
        },
        include: {
            edicion: {
                select: { estado: true }
            }
        }
    })

    const conteo = {
        ESPERA: 0,
        ACTIVA: 0,
        FINALIZADA: 0
    }

    // Contar por estado de edición
    inscripciones.forEach(insc => {
        if (insc.edicion.estado in conteo) {
            conteo[insc.edicion.estado as keyof typeof conteo]++
        }
    })

    // Obtener certificados para ver cuántos realmente completó
    const certificadosCount = await prisma.certificados.count({
        where: { estudiante: { usuario: { correo } } }
    })

    return [
        {
            name: 'ESPERA',
            value: conteo.ESPERA,
            fill: 'var(--color-ESPERA)'
        },
        {
            name: 'ACTIVA',
            value: conteo.ACTIVA,
            fill: 'var(--color-ACTIVA)'
        },
        {
            name: 'FINALIZADA',
            value: certificadosCount,
            fill: 'var(--color-FINALIZADA)'
        }
    ]
}

async function getDashboardStats(correo: string): Promise<Stat[]> {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const unaSemanaDespues = new Date(hoy)
    unaSemanaDespues.setDate(hoy.getDate() + 7)

    // 1. Clases hoy
    const clasesHoy = await prisma.clases.count({
        where: {
            edicion: {
                inscripciones: {
                    some: {
                        estudiante: { usuario: { correo } },
                        estado: true
                    }
                },
                estado: 'ACTIVA'
            },
            fecha: {
                gte: hoy,
                lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000)
            }
        }
    })

    // 2. Exámenes esta semana
    const examenesSemana = await prisma.examenes.count({
        where: {
            edicion: {
                inscripciones: {
                    some: {
                        estudiante: { usuario: { correo } },
                        estado: true
                    }
                }
            },
            fechaLimite: {
                gte: hoy,
                lte: unaSemanaDespues
            },
            NOT: {
                calificaciones: {
                    some: { estudiante: { usuario: { correo } } }
                }
            }
        }
    })

    // 3. Materiales nuevos (última semana)
    const unaSemanaAtras = new Date(hoy)
    unaSemanaAtras.setDate(hoy.getDate() - 7)

    const materialesNuevos = await prisma.materiales.count({
        where: {
            clase: {
                edicion: {
                    inscripciones: {
                        some: {
                            estudiante: { usuario: { correo } },
                            estado: true
                        }
                    },
                    estado: 'ACTIVA'
                }
            },
            creadoEn: {
                gte: unaSemanaAtras
            }
        }
    })

    // 4. Clases pasadas esta semana (para repaso)
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay()) // Domingo de esta semana

    const clasesPasadas = await prisma.clases.count({
        where: {
            edicion: {
                inscripciones: {
                    some: {
                        estudiante: { usuario: { correo } },
                        estado: true
                    }
                }
            },
            fecha: {
                gte: inicioSemana,
                lt: hoy
            }
        }
    })

    return [
        {
            titulo: "Clases hoy",
            valor: clasesHoy,
            badge: clasesHoy > 0 ? "hoy" : "libre",
            descripcion: "Clases programadas para hoy",
            icon: <Calendar  className="size-6 text-primary" />
        },
        {
            titulo: "Exámenes próximos",
            valor: examenesSemana,
            badge: examenesSemana > 0 ? "pronto" : "clear",
            descripcion: "Exámenes en los próximos 7 días",
            icon: <FileText className="size-6 text-primary" />
        },
        {
            titulo: "Material nuevo",
            valor: materialesNuevos,
            badge: materialesNuevos > 0 ? "nuevo" : "actualizado",
            descripcion: "Materiales nuevos última semana",
            icon: <FolderPlus className="size-6 text-primary" />
        },
        {
            titulo: "Clases por repasar",
            valor: clasesPasadas,
            badge: clasesPasadas > 0 ? "pendiente" : "al día",
            descripcion: "Clases de esta semana por repasar",
            icon: <Eye className="size-6 text-primary" />
        }
    ]
}

export default async function DashboardPage() {
    const session = await getServerSession();

    if (!session) return notFound()
    const stats = await getDashboardStats(session.user?.email!)
    const estadosEdicionesEstudiante = await getBalanceFormacionPie(session.user.email!)
    const misCursos = await getMisCursos(session.user.email!);
    const cursoActual = await getCardInfoCursoActual(session.user?.email!);
    return (
        <ContentLayout title="Dashboard">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        Dashboard
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Panel</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <DashboardClient
                stats={stats}
                misCursos={misCursos}
                piechart={estadosEdicionesEstudiante}
                cursoActual={cursoActual}
            />


        </ContentLayout>
    );
}
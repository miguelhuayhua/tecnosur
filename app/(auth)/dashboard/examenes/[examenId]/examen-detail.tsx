"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, BookOpen, Award, FileText, User, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
        fechaPresentado: Date;
        comentarios?: string;
    } | null;
    curso: {
        id: string;
        titulo: string;
        descripcion: string;
        urlMiniatura?: string | null;
        edicionId: string;
    };
}

interface ExamenDetailProps {
    examen: Examen;
}

export function ExamenDetail({ examen }: ExamenDetailProps) {
    const formatFecha = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-BO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date(fecha));
    }

    const formatHora = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-BO', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(fecha));
    }

    const getEstadoExamen = () => {
        const ahora = new Date();
        const disponible = new Date(examen.fechaDisponible);
        const limite = new Date(examen.fechaLimite);

        if (ahora < disponible) {
            return { estado: "Próximo", color: "blue", descripcion: "El examen aún no está disponible" };
        }
        if (ahora > limite) {
            return { estado: "Finalizado", color: "gray", descripcion: "El período del examen ha concluido" };
        }
        if (examen.calificacion) {
            return { estado: "Calificado", color: "green", descripcion: "Tu examen ha sido calificado" };
        }
        return { estado: "Disponible", color: "green", descripcion: "Puedes presentar el examen" };
    }

    const estado = getEstadoExamen();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
            {/* Columna Izquierda - Información del Examen (2/3) */}
            <div className="lg:col-span-2 space-y-6">
                {/* Header del Examen */}
                <Card>
                    <CardContent >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">{examen.titulo}</h1>
                                <Badge
                                    className={`mt-2 ${estado.color === "green" ? "bg-green-100 text-green-800" :
                                        estado.color === "blue" ? "bg-blue-100 text-blue-800" :
                                            "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {estado.estado}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <div className={`text-4xl font-bold  ${examen.calificacion?.aprobado ? 'text-green-600' : 'text-red-600'}`}>
                                    {examen.calificacion ? (
                                        <div className="flex items-center gap-2">
                                            <Award className="h-8 w-8" />
                                            {examen.calificacion.nota}
                                            <span className="text-lg text-muted-foreground">/ {examen.notaMaxima}</span>
                                        </div>
                                    ) : (
                                        <div className="text-2xl text-muted-foreground">-</div>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {examen.calificacion ?
                                        (examen.calificacion.aprobado ? "Aprobado" : "No Aprobado") :
                                        "Sin calificar"
                                    }
                                </div>
                            </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                            {estado.descripcion}
                        </p>

                        {/* Fechas y Horas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Fecha Disponible */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    <span>Disponible desde</span>
                                </div>
                                <div className="text-lg font-semibold">
                                    {formatFecha(examen.fechaDisponible)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatHora(examen.fechaDisponible)}</span>
                                </div>
                            </div>

                            {/* Fecha Límite */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    <span>Disponible hasta</span>
                                </div>
                                <div className="text-lg font-semibold">
                                    {formatFecha(examen.fechaLimite)}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatHora(examen.fechaLimite)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Descripción del Examen */}
                {examen.descripcion && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Descripción del Examen
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {examen.descripcion}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Información de Calificación */}
                {examen.calificacion && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Detalles de Calificación
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Fecha de Presentación</div>
                                        <div className="font-semibold">
                                            {formatFecha(examen.calificacion.fechaPresentado)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatHora(examen.calificacion.fechaPresentado)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Estado</div>
                                        <Badge className={
                                            examen.calificacion.aprobado ?
                                                "bg-green-100 text-green-800" :
                                                "bg-red-100 text-red-800"
                                        }>
                                            {examen.calificacion.aprobado ? "Aprobado" : "No Aprobado"}
                                        </Badge>
                                    </div>
                                </div>
                                {examen.calificacion.comentarios && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-2">Comentarios del Instructor</div>
                                        <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                            {examen.calificacion.comentarios}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Columna Derecha - Información del Curso (1/3) */}
            <div className="space-y-6">
                {/* Tarjeta del Curso */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Información del Curso
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Imagen del Curso */}
                        {examen.curso.urlMiniatura ? (
                            <div className="relative h-32 w-full rounded-lg overflow-hidden">
                                <Image
                                    src={examen.curso.urlMiniatura}
                                    alt={examen.curso.titulo}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-32 w-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-12 w-12 text-blue-500/50" />
                            </div>
                        )}

                        {/* Título del Curso */}
                        <div>
                            <h3 className="font-semibold text-lg mb-2">
                                <Link
                                    href={`/dashboard/cursos/${examen.curso.edicionId}`}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {examen.curso.titulo}
                                </Link>
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {examen.curso.descripcion}
                            </p>
                        </div>

                        {/* Botón al Curso */}
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/cursos/${examen.curso.edicionId}`}>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Ir al Curso
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Información de Notas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Sistema de Calificación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Nota Máxima</span>
                            <span className="font-semibold">{examen.notaMaxima} pts</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Nota Mínima para Aprobar</span>
                            <span className="font-semibold">{examen.notaMinima} pts</span>
                        </div>
                        <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Tu Calificación</span>
                                <span className={`font-bold text-lg ${examen.calificacion ?
                                    (examen.calificacion.aprobado ? 'text-green-600' : 'text-red-600') :
                                    'text-muted-foreground'
                                    }`}>
                                    {examen.calificacion ? examen.calificacion.nota : '-'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Acciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Acciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/dashboard/examenes">
                                ← Volver a Exámenes
                            </Link>
                        </Button>
                        {estado.estado === "Disponible" && (
                            <Button className="w-full">
                                Presentar Examen
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
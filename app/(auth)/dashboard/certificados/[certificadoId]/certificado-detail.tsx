"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Award, ExternalLink, BookOpen, FileText, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Certificado {
    id: string;
    codigoUnico: string;
    fechaEmision: Date;
    notaFinal?: number;
    urlCertificado?: string;
    estudiante: {
        nombre: string;
        correo: string;
    };
    curso: {
        id: string;
        titulo: string;
        descripcion: string;
        urlMiniatura?: string | null;
        edicionId: string;
    };
    edicion: {
        codigo: string;
        fechaInicio: Date;
        fechaFin: Date;
        notaMinima: number;
        notaMaxima: number;
    };
    examenes: {
        id: string;
        titulo: string;
        notaMaxima: number;
        notaMinima: number;
        calificacion: {
            id: string;
            nota: number;
            aprobado: boolean;
        } | null;
    }[];
}

interface CertificadoDetailProps {
    certificado: Certificado;
}

export function CertificadoDetail({ certificado }: CertificadoDetailProps) {
    const formatFecha = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-BO', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(fecha));
    }

    const getEstadoCertificado = () => {
        if (!certificado.notaFinal) return { estado: "Pendiente", color: "secondary" as const };
        return certificado.notaFinal >= certificado.edicion.notaMinima ?
            { estado: "Aprobado", color: "success" as const } :
            { estado: "Reprobado", color: "destructive" as const };
    }

    const estado = getEstadoCertificado();
    
    const examenesConNota = certificado.examenes.filter(e => e.calificacion?.nota);
    const promedioExamenes = examenesConNota.length > 0 ?
        examenesConNota.reduce((sum, examen) => sum + (examen.calificacion?.nota || 0), 0) / examenesConNota.length :
        0;

    const esAprobado = estado.color === "success";
    const esReprobado = estado.color === "destructive";

    return (
        <div className="max-w-4xl mx-auto space-y-4 mt-10 py-4">
            {/* Header Compacto */}
            <div className="bg-card rounded-lg border shadow-sm p-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Award className={`h-8 w-8 flex-shrink-0 ${
                            esAprobado ? 'text-green-600' : esReprobado ? 'text-red-600' : 'text-muted-foreground'
                        }`} />
                        <div className="flex-1 min-w-0">
                            <h1 className="text-base font-semibold text-muted-foreground">
                                Certificado de Finalización
                            </h1>
                            <p className="text-sm font-bold font-mono mt-1 truncate">
                                #{certificado.codigoUnico}
                            </p>
                        </div>
                    </div>
                    <Badge 
                        className={`font-bold px-4 py-1.5 shadow-md flex-shrink-0 ${
                            esAprobado 
                                ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' 
                                : esReprobado
                                ? 'bg-red-600 hover:bg-red-700 text-white border-red-700'
                                : 'bg-gray-500 text-white'
                        }`}
                    >
                        {estado.estado}
                    </Badge>
                </div>

                {/* Info Grid Compacta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-4">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Estudiante</p>
                        <p className="font-bold">{certificado.estudiante.nombre}</p>
                        <p className="text-xs text-muted-foreground truncate">{certificado.estudiante.correo}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Curso</p>
                        <p className="font-bold leading-tight">{certificado.curso.titulo}</p>
                        <Badge variant="outline" className="text-xs font-mono font-bold mt-1">
                            {certificado.edicion.codigo}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Emisión</p>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="font-bold">{formatFecha(certificado.fechaEmision)}</p>
                        </div>
                    </div>
                </div>

                {/* Nota Final - Destacada con colores */}
                <div className={`rounded-lg border-2 p-4 ${
                    esAprobado 
                        ? 'bg-green-50 dark:bg-green-950/20 border-green-500' 
                        : esReprobado
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
                        : 'bg-muted/50 border-muted'
                }`}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-center">
                            <p className={`text-xs font-semibold uppercase mb-1 ${
                                esAprobado 
                                    ? 'text-green-700 dark:text-green-400' 
                                    : esReprobado
                                    ? 'text-red-700 dark:text-red-400'
                                    : 'text-muted-foreground'
                            }`}>
                                Nota Final
                            </p>
                            <p className={`text-5xl font-black tabular-nums ${
                                esAprobado 
                                    ? 'text-green-600 dark:text-green-500' 
                                    : esReprobado
                                    ? 'text-red-600 dark:text-red-500'
                                    : 'text-foreground'
                            }`}>
                                {certificado.notaFinal?.toFixed(1) ?? "—"}
                            </p>
                        </div>
                        
                        <div className="h-16 w-px bg-border/50" />
                        
                        <div className="flex gap-6 text-center">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Escala</p>
                                <p className="text-xl font-bold tabular-nums">
                                    {certificado.edicion.notaMinima}-{certificado.edicion.notaMaxima}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Mínimo</p>
                                <p className="text-xl font-bold tabular-nums text-primary">
                                    {certificado.edicion.notaMinima}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2 mt-4">
                    {certificado.urlCertificado ? (
                        <>
                            <Button asChild size="sm" className="flex-1">
                                <Link href={certificado.urlCertificado} target="_blank">
                                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs">Ver PDF</span>
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/cursos/${certificado.curso.edicionId}`}>
                                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                                    <span className="text-xs">Ver Curso</span>
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" disabled size="sm" className="flex-1">
                            <FileText className="h-3.5 w-3.5 mr-1.5" />
                            <span className="text-xs">PDF No Disponible</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Calificaciones Compactas */}
            {certificado.examenes.length > 0 && (
                <div className="bg-card rounded-lg border shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold">Calificaciones</h2>
                        {promedioExamenes > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-md">
                                <Award className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-medium">
                                    Promedio: <span className="font-bold">{promedioExamenes.toFixed(1)}</span>
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {certificado.examenes.map((examen, index) => (
                            <div 
                                key={examen.id} 
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <div className="flex items-center justify-center w-6 h-6 rounded bg-background border text-xs font-semibold text-muted-foreground flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm truncate">{examen.titulo}</h4>
                                        <p className="text-xs text-muted-foreground">Mín: {examen.notaMinima}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                    {examen.calificacion ? (
                                        <>
                                            <div className="text-right">
                                                <div className={`text-xl font-bold tabular-nums ${
                                                    examen.calificacion.aprobado 
                                                        ? 'text-green-600 dark:text-green-500' 
                                                        : 'text-red-600 dark:text-red-500'
                                                }`}>
                                                    {examen.calificacion.nota}
                                                </div>
                                                <div className="text-xs text-muted-foreground">/{examen.notaMaxima}</div>
                                            </div>
                                            <div className={`p-1.5 rounded-md ${
                                                examen.calificacion.aprobado 
                                                    ? 'bg-green-100 dark:bg-green-950' 
                                                    : 'bg-red-100 dark:bg-red-950'
                                            }`}>
                                                {examen.calificacion.aprobado ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded">
                                            Sin nota
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Información de Edición Compacta */}
            <div className="bg-card rounded-lg border shadow-sm p-4">
                <h2 className="text-base font-bold mb-3">Información de la Edición</h2>
                <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Código</p>
                        <Badge variant="secondary" className="text-xs font-mono font-bold">
                            {certificado.edicion.codigo}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Inicio</p>
                        <p className="font-semibold">{formatFecha(certificado.edicion.fechaInicio)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Fin</p>
                        <p className="font-semibold">{formatFecha(certificado.edicion.fechaFin)}</p>
                    </div>
                </div>
            </div>

            {/* Botón Volver */}
            <div className="text-center pt-2">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/certificados" className="text-xs">
                        ← Volver a Certificados
                    </Link>
                </Button>
            </div>
        </div>
    );
}
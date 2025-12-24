"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EventBullet } from "@/components/dashboard/event-bullet";
import { Clock, Book, Calendar, GraduationCap, AlertCircle } from "lucide-react";
import { CalendarEvento } from "@/types/calendario";
import { formatTime } from "@/lib/helpers";

interface EventListDialogProps {
    date: Date;
    events: CalendarEvento[];
    maxVisibleEvents?: number;
    children?: ReactNode;
}

export function EventListDialog({
    date,
    events,
    maxVisibleEvents = 3,
    children,
}: EventListDialogProps) {
    const cellEvents = events;
    const hiddenEventsCount = Math.max(cellEvents.length - maxVisibleEvents, 0);

    const defaultTrigger = (
        <span className="cursor-pointer hover:underline text-sm text-blue-600 font-medium">
            +{hiddenEventsCount} más...
        </span>
    );

    const getEventColor = (event: CalendarEvento) => {
        if (event.color) return event.color;
        return event.type === 'clase' ? 'blue' : 'red';
    };

    const getEventInfo = (event: CalendarEvento) => {
        const startDate = parseISO(event.startDate);
        const endDate = parseISO(event.endDate);
        const isExamen = event.type === 'examen';
        const eventInfo = event as any;

        return {
            startDate,
            endDate,
            isExamen,
            curso: event.edicion?.curso?.titulo || "Curso no disponible",
            fechaDisponible: isExamen ? parseISO(eventInfo.fechaDisponible) : null,
            fechaLimite: isExamen ? parseISO(eventInfo.fechaLimite) : null,
            notaMinima: eventInfo.notaMinima,
            notaMaxima: eventInfo.notaMaxima,
        };
    };

    const formatTimeRange = (start: Date, end: Date) => {
        return `${formatTime(start, true)} - ${formatTime(end, true)}`;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children || defaultTrigger}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Eventos del {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                    </DialogTitle>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto space-y-3 py-2">
                    {cellEvents.length > 0 ? (
                        cellEvents.map((event) => {
                            const info = getEventInfo(event);

                            return (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-3 p-4 border border-border rounded-lg"
                                >
                                    <EventBullet color={getEventColor(event)} />
                                    <div className="flex-1 min-w-0 space-y-3">
                                        {/* Título y Badge */}
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">
                                                {event.titulo}
                                            </span>
                                            <Badge
                                                variant="default"
                                                className={cn(
                                                    "text-xs text-white",
                                                    event.type === 'clase'
                                                        ? "bg-blue-600"
                                                        : "bg-red-600"
                                                )}
                                            >
                                                {event.type === 'clase' ? 'Clase' : 'Examen'}
                                            </Badge>
                                        </div>

                                        {/* Información específica para Exámenes */}
                                        {info.isExamen && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Calendar className="size-3 text-muted-foreground" />
                                                    <div>
                                                        <span className="font-medium">Disponible desde:</span>
                                                        <span className="text-muted-foreground ml-1">
                                                            {format(info.fechaDisponible!, "d MMM yyyy", { locale: es })} a las {formatTime(info.fechaDisponible!, true)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <AlertCircle className="size-3 text-muted-foreground" />
                                                    <div>
                                                        <span className="font-medium">Fecha límite:</span>
                                                        <span className="text-muted-foreground ml-1">
                                                            {format(info.fechaLimite!, "d MMM yyyy", { locale: es })} a las {formatTime(info.fechaLimite!, true)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <GraduationCap className="size-3 text-muted-foreground" />
                                                    <div>
                                                        <span className="font-medium">Rango de calificación:</span>
                                                        <span className="text-muted-foreground ml-1">
                                                            {info.notaMinima} - {info.notaMaxima} puntos
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Book className="size-3 text-muted-foreground" />
                                                    <span>{info.curso}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Información para Clases */}
                                        {!info.isExamen && (
                                            <>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    <span>{formatTimeRange(info.startDate, info.endDate)}</span>
                                                </div>

                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Book className="size-3" />
                                                    <span>{info.curso}</span>
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    <span>Fecha: {format(info.startDate, "d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                                                </div>
                                            </>
                                        )}

                                        {/* Descripción */}
                                        {event.descripcion && (
                                            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                                                <p className="font-medium mb-1">Descripción:</p>
                                                <p className="whitespace-pre-wrap leading-relaxed">
                                                    {event.descripcion}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                No hay eventos para esta fecha.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
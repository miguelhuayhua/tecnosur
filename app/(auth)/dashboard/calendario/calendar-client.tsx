import React from "react";
import { CalendarBody } from "@/components/dashboard/calendar-body";
import { CalendarProvider } from "@/components/dashboard/calendar-context";
import { CalendarHeader } from "@/components/dashboard/calendar-header";
import { examenes, clases, edicionesCursos, cursos } from "@/prisma/generated";

interface CalendarProps {
  clases: Array<clases & { edicion: edicionesCursos & { curso: cursos } }>;
  examenes: Array<examenes & { edicion: edicionesCursos & { curso: cursos } }>;
}

export function CalendarClient({ clases, examenes }: CalendarProps) {
  // Extraer lista única de cursos para el filtro
  const cursosUnicos = Array.from(
    new Set([
      ...clases.map(c => c.edicion.curso.titulo),
      ...examenes.map(e => e.edicion.curso.titulo)
    ])
  ).sort();

  const clasesCount = clases.length;
  const examenesCount = examenes.length;

  return (
    <CalendarProvider>
      <div className="w-full  border rounded-xl  shadow-sm">
        <CalendarHeader
          clasesCount={clasesCount}
          examenesCount={examenesCount}
          cursos={cursosUnicos}
        />
        <CalendarBody clases={clases as any} examenes={examenes as any} />
      </div>
    </CalendarProvider>
  );
}
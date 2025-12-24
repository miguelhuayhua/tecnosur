"use client";

import React from "react";
import { useCalendar } from "@/components/dashboard/calendar-context";
import { CalendarMonthView } from "@/components/dashboard/calendar-month-view";
import { Clase, Examen } from "@/types/calendario";

interface CalendarBodyProps {
  clases: Clase[]
  examenes: Examen[]
}

export function CalendarBody({ clases, examenes }: CalendarBodyProps) {
  const { view, selectedCourses } = useCalendar();

  // Aplicar filtro de cursos si hay alguno seleccionado
  const clasesFiltradas = selectedCourses.length > 0
    ? clases.filter(clase => selectedCourses.includes(clase.edicion.curso.titulo))
    : clases;

  const examenesFiltrados = selectedCourses.length > 0
    ? examenes.filter(examen => selectedCourses.includes(examen.edicion.curso.titulo))
    : examenes;

  return (
    <div className="w-full h-full  relative">
      {view === "month" && (
        <CalendarMonthView
          clases={clasesFiltradas}
          examenes={examenesFiltrados}
        />
      )}
    </div>
  );
}
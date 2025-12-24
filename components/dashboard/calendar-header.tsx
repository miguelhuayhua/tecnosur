"use client";

import { useCalendar } from "@/components/dashboard/calendar-context";
import { DateNavigator } from "@/components/dashboard/date-navigator";
import { TodayButton } from "@/components/dashboard/today-button";
import { CourseFilter } from "@/components/dashboard/course-filter";
import { Badge } from "../ui/badge";

interface CalendarHeaderProps {
  clasesCount: number;
  examenesCount: number;
  cursos: string[];
}

export function CalendarHeader({ clasesCount, examenesCount, cursos }: CalendarHeaderProps) {
  const { selectedCourses } = useCalendar();

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 items-center md:flex-row lg:items-center md:justify-between">
      {/* Lado izquierdo: Navegación y fecha */}
      <TodayButton />
      <DateNavigator
        clasesCount={clasesCount}
        examenesCount={examenesCount}
      />
      {/* Lado derecho: Filtros y información */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        {/* Información de filtros activos */}
        {selectedCourses.length > 0 && (
          <div className="flex justify-center sm:justify-start">
            <Badge variant="outline" className="text-xs sm:text-sm">
              {selectedCourses.length} curso{selectedCourses.length > 1 ? 's' : ''} seleccionado{selectedCourses.length > 1 ? 's' : ''}
            </Badge>
          </div>
        )}

        {/* Filtro de cursos */}
        <div className="flex justify-center sm:justify-start">
          <CourseFilter cursos={cursos} />
        </div>
      </div>
    </div>
  );
}
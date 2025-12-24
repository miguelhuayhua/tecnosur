import { useMemo } from "react";
import { useCalendar } from "@/components/dashboard/calendar-context";

import { DayCell } from "@/components/dashboard/day-cell";
import { calculateMonthEventPositions, getCalendarCells } from "@/lib/helpers";
import { Clase, Evento, Examen } from "@/types/calendario";

interface IProps {
  clases: Clase[];
  examenes: Examen[];
}
const WEEK_DAYS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export function CalendarMonthView({ clases, examenes }: IProps) {
  const { selectedDate } = useCalendar();

  // Convertimos todas las clases y exámenes a eventos unificados
  const allEvents: Evento[] = useMemo(() => {
    return [...clases, ...examenes];
  }, [clases, examenes]);

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const eventPositions = useMemo(
    () => {
      const positions = calculateMonthEventPositions(allEvents, selectedDate);
      return positions;
    },
    [allEvents, selectedDate],
  );

  return (
    <div>
      <div className="grid grid-cols-7">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="flex items-center justify-center py-2"
          >
            <span className="text-xs font-medium text-t-quaternary">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map((cell, index) => (
          <DayCell
            key={index}
            cell={cell}
            events={allEvents}
            eventPositions={eventPositions}
          />
        ))}
      </div>
    </div>
  );
}
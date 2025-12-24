"use client";

import { cva } from "class-variance-authority";
import { isToday, startOfDay, isSunday, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";

import { cn } from "@/lib/utils";
import { EventListDialog } from "@/components/dashboard/events-list-dialog";
import { EventBullet } from "@/components/dashboard/event-bullet";
import { MonthEventBadge } from "@/components/dashboard/month-event-badge";
import { useMediaQuery } from "@/hooks/use-calendar";
import { getMonthCellEvents } from "@/lib/helpers";
import { CalendarEvento, Evento, ICalendarCell } from "@/types/calendario";

interface IProps {
  cell: ICalendarCell;
  events: Evento[];
  eventPositions: Record<string, number>;
}

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, events, eventPositions }: IProps) {
  const { day, currentMonth, date } = cell;
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // Memoize cellEvents and currentCellMonth for performance
  const { cellEvents, currentCellMonth } = useMemo(() => {
    const cellEvents = getMonthCellEvents(date, events, eventPositions) as CalendarEvento[];
    const currentCellMonth = startOfDay(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );
    return { cellEvents, currentCellMonth };
  }, [date, events, eventPositions]);

  // Función para determinar el color basado en el tipo de evento
  const getEventColor = (event: CalendarEvento) => {
    if (event.color) return event.color;

    // Colores específicos por tipo
    switch (event.type) {
      case 'clase':
        return 'blue';
      case 'examen':
        return 'red';
      default:
        return 'blue';
    }
  };

  // Memoize event rendering for each position with animation
  const renderEventAtPosition = useCallback(
    (position: number) => {
      const event = cellEvents.find((e) => e.position === position);
      if (!event) {
        return (
          <motion.div
            key={`empty-${position}`}
            className="lg:flex-1"
            initial={false}
            animate={false}
          />
        );
      }

      const showBullet = isSameMonth(
        new Date(event.startDate),
        currentCellMonth
      );

      return (
        <motion.div
          key={`event-${event.id}-${position}`}
          className="lg:flex-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <>
            {showBullet && (
              <EventBullet
                className="lg:hidden"
                color={getEventColor(event)}
              />
            )}

            <MonthEventBadge
              className="hidden lg:flex"
              event={event}
              date={date}
              cellDate={startOfDay(date)}
            />
          </>
        </motion.div>
      );
    },
    [cellEvents, currentCellMonth, date]
  );

  const showMoreCount = cellEvents.length - MAX_VISIBLE_EVENTS;

  const showMobileMore = isMobile && currentMonth && showMoreCount > 0;
  const showDesktopMore = !isMobile && currentMonth && showMoreCount > 0;

  const cellContent = useMemo(
    () => (
      <motion.div
        className={cn(
          "flex h-full lg:min-h-[10rem] flex-col gap-1 border-l border-t",
          isSunday(date) && "border-l-0",
          "cursor-default"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-full h-full py-2">
          <motion.span
            className={cn(
              "h-6 px-1 text-xs font-semibold lg:px-2",
              !currentMonth && "opacity-20",
              isToday(date) &&
              "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground"
            )}
          >
            {day}
          </motion.span>

          <motion.div
            className={cn(
              "flex h-fit gap-1 px-2 mt-1 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0",
              !currentMonth && "opacity-50"
            )}
          >
            {cellEvents.length === 0 ? (
              <div className="w-full h-full flex justify-center items-center">
                {/* Espacio vacío */}
              </div>
            ) : (
              [0, 1, 2].map(renderEventAtPosition)
            )}
          </motion.div>

          {showMobileMore && (
            <div className="flex justify-end items-end mx-2">
              <span className="text-[0.6rem] font-semibold text-accent-foreground">
                +{showMoreCount}
              </span>
            </div>
          )}

          {showDesktopMore && (
            <motion.div
              className={cn(
                "h-4.5 px-1.5 my-2 text-end text-xs font-semibold text-muted-foreground",
                !currentMonth && "opacity-50"
              )}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EventListDialog date={date} events={cellEvents} />
            </motion.div>
          )}
        </div>
      </motion.div>
    ),
    [
      date,
      day,
      currentMonth,
      cellEvents,
      showMobileMore,
      showDesktopMore,
      showMoreCount,
      renderEventAtPosition,
    ]
  );

  if (isMobile && currentMonth) {
    return (
      <EventListDialog date={date} events={cellEvents}>
        {cellContent}
      </EventListDialog>
    );
  }

  return cellContent;
}
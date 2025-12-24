"use client";

import { useLocalStorage } from "@/hooks/use-calendar";
import type React from "react";
import { createContext, useContext, useState } from "react";


type TCalendarView = "month";

interface CalendarSettings {
  badgeVariant: "dot" | "colored";
  view: TCalendarView;
  use24HourFormat: boolean;
}

const DEFAULT_SETTINGS: CalendarSettings = {
  badgeVariant: "colored",
  view: "month",
  use24HourFormat: true,
};

interface ICalendarContext {
  selectedDate: Date;
  view: TCalendarView;
  setView: (view: TCalendarView) => void;
  use24HourFormat: boolean;
  toggleTimeFormat: () => void;
  setSelectedDate: (date: Date) => void;
  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;
  // Filtro de cursos
  selectedCourses: string[];
  filterEventsByCourse: (curso: string) => void;
  clearCourseFilter: () => void;
}

const CalendarContext = createContext({} as ICalendarContext);

interface CalendarProviderProps {
  children: React.ReactNode;
  badge?: "dot" | "colored";
  view?: TCalendarView;
}

export function CalendarProvider({
  children,
  badge = "colored",
  view = "month",
}: CalendarProviderProps) {
  const [settings, setSettings] = useLocalStorage<CalendarSettings>(
    "calendar-settings",
    {
      ...DEFAULT_SETTINGS,
      badgeVariant: badge,
      view: view,
    },
  );

  const [badgeVariant, setBadgeVariantState] = useState<"dot" | "colored">(
    settings.badgeVariant,
  );
  const [currentView, setCurrentViewState] = useState<TCalendarView>(
    settings.view,
  );
  const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(
    settings.use24HourFormat,
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
    setSettings({
      ...settings,
      ...newPartialSettings,
    });
  };

  const setBadgeVariant = (variant: "dot" | "colored") => {
    setBadgeVariantState(variant);
    updateSettings({ badgeVariant: variant });
  };

  const setView = (newView: TCalendarView) => {
    setCurrentViewState(newView);
    updateSettings({ view: newView });
  };

  const toggleTimeFormat = () => {
    const newValue = !use24HourFormat;
    setUse24HourFormatState(newValue);
    updateSettings({ use24HourFormat: newValue });
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  // Funciones para filtro de cursos
  const filterEventsByCourse = (curso: string) => {
    const isCourseSelected = selectedCourses.includes(curso);
    const newCourses = isCourseSelected
      ? selectedCourses.filter((c) => c !== curso)
      : [...selectedCourses, curso];
    
    setSelectedCourses(newCourses);
  };

  const clearCourseFilter = () => {
    setSelectedCourses([]);
  };

  const value: ICalendarContext = {
    selectedDate,
    setSelectedDate: handleSelectDate,
    badgeVariant,
    setBadgeVariant,
    view: currentView,
    use24HourFormat,
    toggleTimeFormat,
    setView,
    // Filtro de cursos
    selectedCourses,
    filterEventsByCourse,
    clearCourseFilter,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context)
    throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
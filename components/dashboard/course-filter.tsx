"use client";

import { CheckIcon, Filter, RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { useCalendar } from "@/components/dashboard/calendar-context";

interface CourseFilterProps {
  cursos: string[];
}

export function CourseFilter({ cursos }: CourseFilterProps) {
  const { selectedCourses, filterEventsByCourse, clearCourseFilter } = useCalendar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Toggle variant="outline" className="cursor-pointer w-full">
          <Filter className="h-4 w-4" />
          <span className="ml-2">Cursos</span>
        </Toggle>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] max-h-[300px] overflow-y-auto">
        {cursos.length > 0 ? cursos.map((curso, index) => (
          <DropdownMenuItem
            key={index}
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              filterEventsByCourse(curso);
            }}
          >
            <div className="size-3.5 rounded-full bg-blue-600" />
            <span className="flex justify-between items-center gap-2 flex-1">
              {curso}
              {selectedCourses.includes(curso) && (
                <span className="text-blue-500">
                  <CheckIcon className="size-4" />
                </span>
              )}
            </span>
          </DropdownMenuItem>
        )) : <DropdownMenuItem disabled>
          <span>
            No tienes cursos
          </span>
        </DropdownMenuItem>}
        <Separator className="my-2" />
        <DropdownMenuItem
          disabled={selectedCourses.length === 0}
          className="flex gap-2 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            clearCourseFilter();
          }}
        >
          <RefreshCcw className="size-3.5" />
          Limpiar Filtros
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
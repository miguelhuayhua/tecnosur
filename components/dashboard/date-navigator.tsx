import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCalendar } from "@/components/dashboard/calendar-context";
import { es } from "date-fns/locale";
import { navigateDate, rangeText } from "@/lib/helpers";

interface CalendarHeaderProps {
  clasesCount: number;
  examenesCount: number;
}

export function DateNavigator({ clasesCount, examenesCount }: CalendarHeaderProps) {
  const { selectedDate, setSelectedDate } = useCalendar();

  const month = format(selectedDate, "MMMM", { locale: es });
  const year = selectedDate.getFullYear();
  const totalEventos = clasesCount + examenesCount;

  const handlePrevious = () =>
    setSelectedDate(navigateDate(selectedDate, "previous"));

  const handleNext = () =>
    setSelectedDate(navigateDate(selectedDate, "next"));

  return (
    <div className="space-y-3">
      {/* Fila 1: Navegación y mes/año */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center flex-1">
          <span className="text-lg sm:text-xl font-semibold capitalize">
            {month} {year}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Fila 2: Rango de fechas y contadores */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground font-medium text-center sm:text-left">
          {rangeText(selectedDate)}
        </p>

        <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
          <Badge variant="secondary" className="text-xs">
            {totalEventos} total
          </Badge>
          {clasesCount > 0 && (
            <Badge variant="outline" className="text-xs border-blue-500">
              {clasesCount} clase{clasesCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {examenesCount > 0 && (
            <Badge variant="outline" className="text-xs border-red-500">
              {examenesCount} examen{examenesCount !== 1 ? 'es' : ''}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { endOfDay, isSameDay, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/components/dashboard/calendar-context";
import { EventDetailsDialog } from "@/components/dashboard/event-details-dialog";
import { EventBullet } from "@/components/dashboard/event-bullet";
import { CalendarEvento } from "@/types/calendario";
import { formatTime } from "@/lib/helpers";

const eventBadgeVariants = cva(
	"mx-1 flex size-auto h-6.5 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs cursor-pointer hover:opacity-80 transition-opacity",
	{
		variants: {
			color: {
				// Solo azul y rojo
				blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
				red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
				// Dot variants
				"blue-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-blue-600",
				"red-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-red-600",
			},
			multiDayPosition: {
				first: "relative z-10 mr-0 rounded-r-none border-r-0 [&>span]:mr-2.5",
				middle: "relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0",
				last: "ml-0 rounded-l-none border-l-0",
				none: "",
			},
			eventType: {
				clase: "border-l-2 border-l-blue-500",
				examen: "border-l-2 border-l-red-500",
			}
		},
		defaultVariants: {
			color: "blue-dot",
		},
	},
);

interface IProps
	extends Omit<
		VariantProps<typeof eventBadgeVariants>,
		"color" | "multiDayPosition" | "eventType"
	> {
	event: CalendarEvento;
	cellDate: Date;
	date: Date;
	eventCurrentDay?: number;
	eventTotalDays?: number;
	className?: string;
	position?: "first" | "middle" | "last" | "none";
}

export function MonthEventBadge({
	event,
	cellDate,
	eventCurrentDay,
	eventTotalDays,
	className,
	date,
	position: propPosition,
}: IProps) {
	const { badgeVariant, use24HourFormat } = useCalendar();

	const itemStart = startOfDay(parseISO(event.startDate));
	const itemEnd = endOfDay(parseISO(event.endDate));

	// Si la celda actual está fuera del rango del evento, no mostrar nada
	if (cellDate < itemStart || cellDate > itemEnd) return null;

	let position: "first" | "middle" | "last" | "none" | undefined;

	if (propPosition) {
		position = propPosition;
	} else if (eventCurrentDay && eventTotalDays) {
		position = "none";
	} else if (isSameDay(itemStart, itemEnd)) {
		position = "none";
	} else if (isSameDay(cellDate, itemStart)) {
		position = "first";
	} else if (isSameDay(cellDate, itemEnd)) {
		position = "last";
	} else {
		position = "middle";
	}

	const renderBadgeText = ["first", "none"].includes(position);
	const renderBadgeTime = ["last", "none"].includes(position);

	// Determinar color basado en el tipo de evento
	const getEventColor = () => {
		// Si el evento ya tiene un color definido, usarlo
		if (event.color) {
			return badgeVariant === "dot" ? `${event.color}-dot` : event.color;
		}

		// Colores por defecto según el tipo de evento
		const defaultColor = event.type === 'clase' ? 'blue' : 'red';
		return badgeVariant === "dot" ? `${defaultColor}-dot` : defaultColor;
	};

	const color = getEventColor() as VariantProps<typeof eventBadgeVariants>["color"];
	const eventType = event.type as VariantProps<typeof eventBadgeVariants>["eventType"];

	const eventBadgeClasses = cn(
		eventBadgeVariants({
			color,
			multiDayPosition: position,
			eventType,
			className
		}),
	);

	// Texto para mostrar en el badge
	const getBadgeTitle = () => {
		if (event.type === 'clase') {
			return `📹 ${event.titulo}`;
		} else {
			return `📝 ${event.titulo}`;
		}
	};

	// Hora a mostrar (para clases usa la hora de inicio, para exámenes no muestra hora)
	const getBadgeTime = () => {
		if (event.type === 'clase' && renderBadgeTime) {
			return formatTime(parseISO(event.startDate), use24HourFormat);
		}
		return null;
	};

	return (
		<EventDetailsDialog date={date} event={event}>
			<div role="button" tabIndex={0} className={eventBadgeClasses}>
				<div className="flex items-center gap-1.5 truncate">
					{!["middle", "last"].includes(position) &&
						badgeVariant === "dot" && (
							<EventBullet color={event.type === 'clase' ? 'blue' : 'red'} />
						)}

					{renderBadgeText && (
						<p className="flex-1 truncate font-semibold">
							{getBadgeTitle()}
						</p>
					)}
				</div>

				<div className="hidden sm:block">
					{getBadgeTime() && (
						<span className="text-xs opacity-75">
							{getBadgeTime()}
						</span>
					)}
				</div>
			</div>
		</EventDetailsDialog>
	);
}
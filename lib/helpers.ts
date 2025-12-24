import {
	addMonths,
	differenceInDays,
	eachDayOfInterval,
	endOfMonth,
	format,
	isSameDay,
	isSameMonth,
	isValid,
	parseISO,
	startOfDay,
	startOfMonth,
	subMonths,
} from "date-fns";
import { es } from "date-fns/locale";

// Solo necesitamos estas interfaces locales
interface BaseEvento {
	id: string;
	titulo: string;
	startDate: string;
	endDate: string;
	type: 'clase' | 'examen';
	color?: string;
}

interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}

export function rangeText(date: Date): string {
	const start = startOfMonth(date);
	const end = endOfMonth(date);
	return `${format(start, "MMM d, yyyy", { locale: es })} - ${format(end, "MMM d, yyyy", { locale: es })}`;
}

export function navigateDate(
	date: Date,
	direction: "previous" | "next",
): Date {
	return direction === "next" ? addMonths(date, 1) : subMonths(date, 1);
}

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();

	const daysInMonth = endOfMonth(selectedDate).getDate();
	const firstDayOfMonth = startOfMonth(selectedDate).getDay();
	const daysInPrevMonth = endOfMonth(new Date(year, month - 1)).getDate();
	const totalDays = firstDayOfMonth + daysInMonth;

	const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
		day: daysInPrevMonth - firstDayOfMonth + i + 1,
		currentMonth: false,
		date: new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
	}));

	const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
		day: i + 1,
		currentMonth: true,
		date: new Date(year, month, i + 1),
	}));

	const nextMonthCells = Array.from(
		{ length: (7 - (totalDays % 7)) % 7 },
		(_, i) => ({
			day: i + 1,
			currentMonth: false,
			date: new Date(year, month + 1, i + 1),
		}),
	);

	return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthEventPositions(
	events: BaseEvento[],
	selectedDate: Date,
): Record<string, number> {
	const monthStart = startOfMonth(selectedDate);
	const monthEnd = endOfMonth(selectedDate);

	const eventPositions: Record<string, number> = {};
	const occupiedPositions: Record<string, boolean[]> = {};

	eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach((day) => {
		occupiedPositions[day.toISOString()] = [false, false, false];
	});

	const sortedEvents = [...events].sort((a, b) => {
		const aDuration = differenceInDays(parseISO(a.endDate), parseISO(a.startDate));
		const bDuration = differenceInDays(parseISO(b.endDate), parseISO(b.startDate));
		return (
			bDuration - aDuration ||
			parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
		);
	});

	sortedEvents.forEach((event) => {
		const eventStart = parseISO(event.startDate);
		const eventEnd = parseISO(event.endDate);
		const eventDays = eachDayOfInterval({
			start: eventStart < monthStart ? monthStart : eventStart,
			end: eventEnd > monthEnd ? monthEnd : eventEnd,
		});

		let position = -1;

		for (let i = 0; i < 3; i++) {
			if (
				eventDays.every((day) => {
					const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
					return dayPositions && !dayPositions[i];
				})
			) {
				position = i;
				break;
			}
		}

		if (position !== -1) {
			eventDays.forEach((day) => {
				const dayKey = startOfDay(day).toISOString();
				occupiedPositions[dayKey][position] = true;
			});
			eventPositions[event.id] = position;
		}
	});

	return eventPositions;
}
export function getMonthCellEvents(
	date: Date,
	events: BaseEvento[],
	eventPositions: Record<string, number>,
) {
	const dayStart = startOfDay(date);
	const eventsForDate = events.filter((event) => {
		const eventStart = parseISO(event.startDate);
		const eventEnd = parseISO(event.endDate);
		const isInRange = (
			(dayStart >= eventStart && dayStart <= eventEnd) ||
			isSameDay(dayStart, eventStart) ||
			isSameDay(dayStart, eventEnd)
		);


		return isInRange;
	});


	return eventsForDate
		.map((event) => ({
			...event,
			position: eventPositions[event.id] ?? -1,
			isMultiDay: !isSameDay(parseISO(event.startDate), parseISO(event.endDate)),
		}))
		.sort((a, b) => {
			if (a.isMultiDay && !b.isMultiDay) return -1;
			if (!a.isMultiDay && b.isMultiDay) return 1;
			return a.position - b.position;
		});
}
export function formatTime(date: Date | string, use24HourFormat: boolean): string {
	const parsedDate = typeof date === "string" ? parseISO(date) : date;
	if (!isValid(parsedDate)) return "";
	return format(parsedDate, use24HourFormat ? "HH:mm" : "h:mm a");
}

export function getEventsForMonth(events: BaseEvento[], date: Date): BaseEvento[] {
	const startOfMonthDate = startOfMonth(date);
	const endOfMonthDate = endOfMonth(date);

	return events.filter((event) => {
		const eventStart = parseISO(event.startDate);
		const eventEnd = parseISO(event.endDate);
		return (
			isValid(eventStart) &&
			isValid(eventEnd) &&
			eventStart <= endOfMonthDate &&
			eventEnd >= startOfMonthDate
		);
	});
}
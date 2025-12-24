import { formatDate } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/components/dashboard/calendar-context";
import { es } from "date-fns/locale";

const MotionButton = motion.create(Button);

export function TodayButton() {
	const { setSelectedDate } = useCalendar();

	const today = new Date();
	const handleClick = () => setSelectedDate(today);

	return (
		<MotionButton
			variant="outline"
			className="flex h-14 w-14 flex-col items-center justify-center p-0 text-center"
			onClick={handleClick}
			whileHover="hover"
			whileTap="tap"
		>
			<motion.span
				className="w-full bg-primary py-1 rounded-t text-xs font-semibold text-primary-foreground"
				initial={{ y: -10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
			>
				{formatDate(today, "MMM", { locale: es }).toUpperCase()}
			</motion.span>
			<motion.span
				className="text-lg font-bold"
				initial={{ y: 10, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
			>
				{today.getDate()}
			</motion.span>
		</MotionButton>
	);
}

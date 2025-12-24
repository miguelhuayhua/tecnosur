import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Definimos el tipo de color basado en nuestras necesidades
type TEventColor = 'blue' | 'red'; // Solo azul y rojo

const eventBulletVariants = cva("size-2 rounded-full", {
  variants: {
    color: {
      blue: "bg-blue-600 dark:bg-blue-500",
      red: "bg-red-600 dark:bg-red-500",
    },
  },
  defaultVariants: {
    color: "blue",
  },
});

interface EventBulletProps {
  color: TEventColor;
  className?: string;
}

export function EventBullet({
  color,
  className,
}: EventBulletProps) {
  return (
    <div
      className={cn(eventBulletVariants({ color, className }))}
    />
  );
}
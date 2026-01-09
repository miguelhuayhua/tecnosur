import React from 'react';
import { ArrowRight } from 'lucide-react';

const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
};

interface InteractiveButtonProps extends React.ComponentProps<"button"> {
    text?: string;
}

const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
    ({ className, text, children, ...props }, ref) => {
        const displayText = text || children;

        return (
            <button
                ref={ref}
                className={cn(
                    "group relative cursor-pointer inline-flex items-center justify-center gap-12 overflow-hidden rounded-full border outline-none border-primary ring-0 bg-primary px-8 py-2 text-primary-foreground transition-colors duration-300",
                    className
                )}
                {...props}
            >
                {/* Capa de fondo que se expande */}
                <div className="absolute inset-0 z-0 flex items-center justify-start px-6">
                    <div className="bg-primary-foreground size-3 scale-100 rounded-full transition-transform duration-500 ease-in-out group-hover:scale-[60]" />
                </div>

                {/* Texto Inicial - Espaciado aumentado significativamente */}
                <div className="relative z-10 flex items-center gap-4 transition-all duration-300 group-hover:translate-x-20 group-hover:opacity-0 ml-6">
                    <span className="inline-block whitespace-nowrap">
                        {displayText}
                    </span>
                </div>

                {/* Texto y Flecha en Hover */}
                <div className="absolute inset-0 z-20 flex translate-x-12 items-center justify-center gap-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <span className="whitespace-nowrap font-semibold text-primary">
                        {displayText}
                    </span>
                    <ArrowRight className="size-5 text-primary" />
                </div>
            </button>
        );
    }
);

InteractiveButton.displayName = "InteractiveButton";

export { InteractiveButton };
import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ExpandableCardProps {
    images: {
        src: string;
        title?: string;
        description?: string;
        href?: string;
    }[];
    className?: string;
}

const ExpandableCards: React.FC<ExpandableCardProps> = ({ images, className = '' }) => {
    return (
        <div className={cn("group/container flex h-80 md:h-[500px] w-full gap-2 md:gap-4 container mx-auto px-4 py-8", className)}>
            {images.map((image, index) => {
                const CardContent = (
                    <>
                        <img
                            className="absolute inset-0 h-full w-full object-cover grayscale-[0.2] transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110"
                            src={image.src}
                            alt={image.title || `Image ${index + 1}`}
                        />
                        {/* Máscara ultra oscura para legibilidad estática, se aclara en hover para ver la imagen */}
                        <div className="absolute inset-0 bg-black/85 z-10 transition-opacity duration-700 group-hover:opacity-30" />

                        {/* Ola Gradiente Decorativa (Inferior) */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-1.5 z-30 opacity-80"
                            style={{
                                background: 'linear-gradient(90deg, var(--primary), var(--secondary), var(--primary))',
                                backgroundSize: '200% 100%',
                                animation: `wave 4s linear infinite`,
                                animationDelay: `${index * 0.5}s`
                            }}
                        />

                        {/* Gradiente Decorativo Inferior Reforzado (Continua) */}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent z-20 opacity-100" />

                        {/* Texto (Visible pero elegante, sin pill contenedor) */}
                        <div className="absolute inset-0 flex items-center justify-center p-4 z-30 transition-all duration-500 group-hover:opacity-0 group-hover:scale-95 group-hover/container:opacity-0">
                            <span className="[writing-mode:vertical-rl] md:[writing-mode:horizontal-tb] text-white font-bold uppercase tracking-[0.3em] md:tracking-[0.6em] text-[12px] md:text-sm rotate-180 md:rotate-0 drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
                                {image.title}
                            </span>
                        </div>

                        {/* Glass Overlay Expandido - Más claro para ver la imagen pero con desenfoque para legibilidad */}
                        <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm opacity-0 transition-all duration-500 group-hover:opacity-100" />

                        {/* Contenido expandido - Elevado z-index */}
                        {(image.title || image.description) && (
                            <div className="absolute inset-x-0 bottom-0 z-50 p-10 opacity-0 transition-all duration-500 delay-150 group-hover:opacity-100">
                                {image.title && (
                                    <h3 className="text-3xl font-bold text-white translate-y-6 transition-transform duration-500 group-hover:translate-y-0 drop-shadow-[0_4px_16px_rgba(0,0,0,1)] text-balance">
                                        {image.title}
                                    </h3>
                                )}
                                {image.description && (
                                    <p className="mt-4 text-base md:text-lg text-white font-medium leading-relaxed translate-y-6 transition-transform duration-500 delay-200 group-hover:translate-y-0 max-w-md drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                        {image.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                );

                const cardClasses = "group relative flex h-full flex-1 cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-[cubic-bezier(0.2,1,0.3,1)] hover:flex-[6] md:hover:flex-[4] shadow-2xl";

                if (image.href) {
                    return (
                        <Link key={index} href={image.href} className={cardClasses}>
                            {CardContent}
                        </Link>
                    )
                }

                return (
                    <div
                        key={index}
                        className={cardClasses}
                    >
                        {CardContent}
                    </div>
                );
            })}
        </div>
    );
};

export { ExpandableCards };
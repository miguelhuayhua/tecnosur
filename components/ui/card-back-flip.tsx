import React, { ReactNode } from 'react';

interface FlipCardProps {
    rotate?: 'x' | 'y';
    className?: string;
    children: ReactNode;
    back: ReactNode;
}

export const FlipCard: React.FC<FlipCardProps> = ({
    rotate = 'y',
    className = '',
    children,
    back
}) => {
    const rotationClass = {
        x: {
            container: 'group-hover:[transform:rotateX(180deg)]',
            back: '[transform:rotateX(180deg)]'
        },
        y: {
            container: 'group-hover:[transform:rotateY(180deg)]',
            back: '[transform:rotateY(180deg)]'
        }
    };

    const rotation = rotationClass[rotate];

    return (
        <div className={`group h-fit [perspective:1000px] ${className}`}>
            <div
                className={`relative h-full rounded-2xl transition-all duration-500 [transform-style:preserve-3d] ${rotation.container}`}
            >
                {/* Front */}
                <div className="relative h-full w-full overflow-hidden rounded-2xl border [backface-visibility:hidden]">
                    {children}
                </div>

                {/* Back */}
                <div
                    className={`absolute inset-0 overflow-hidden rounded-2xl border [backface-visibility:hidden] ${rotation.back}`}
                >
                    {back}
                </div>
            </div>
        </div>
    );
};
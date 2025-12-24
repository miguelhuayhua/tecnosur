'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export const CursoGeneralSkeleton: React.FC<React.HtmlHTMLAttributes<HTMLDivElement>> = ({
    className,
}) => {
    return (
        <Card className={cn("w-full flex flex-col overflow-hidden shadow-none transition-all duration-300 cursor-pointer group", className)}>
            {/* Header con imagen - Mismo height: h-40 */}
            <CardHeader>
                <Skeleton className="h-40 w-full rounded-md" />
            </CardHeader>

            <CardContent className='pb-0'>
                <CardTitle className='flex items-center gap-2 justify-between'>
                    {/* Título - Skeleton en lugar de texto */}
                    <Skeleton className="h-6 flex-1" />
                    {/* Status - Skeleton del mismo tamaño */}
                    <Skeleton className="h-6 w-16" />
                </CardTitle>

                {/* Descripción - Mismo className text-xs */}
                <CardDescription className='text-xs mt-2'>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5 mt-1" />
                    <Skeleton className="h-3 w-3/5 mt-1" />
                </CardDescription>

                {/* Badges - Mismo espacio y estructura */}
                <div className='space-x-2 flex items-center mt-4'>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </CardContent>

            <CardFooter className='border-t-0'>
                <div className="w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2 text-md">
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};
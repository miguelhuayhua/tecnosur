'use client';

import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Separator } from "@/components/ui/separator";
import { Skeleton } from '@/components/ui/skeleton';

export const CursoCardDetalladoVerticalSkeleton: React.FC<React.HtmlHTMLAttributes<HTMLDivElement>> = ({
  className,
}) => {
  return (
    <Card className={cn(
      " group pt-0 transition-all duration-300",
      className
    )}>
      {/* Imagen principal */}
      <div className="relative h-56 w-full overflow-hidden">
        <Skeleton className="absolute inset-0" />
      </div>

      <CardContent className="space-y-4">
        {/* SECCIÓN 1: TÍTULO Y RATING/PRECIO */}
        <div className="space-y-3">
          <div className='flex justify-between items-center'>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2 text-md">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: FECHAS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 ">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex items-center gap-2 ">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="flex items-center gap-2 ">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-2 ">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-2 ">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
      </CardContent>

      <CardFooter >
        <div className="flex gap-2 w-full">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-10" />
        </div>
      </CardFooter>
    </Card>
  );
};
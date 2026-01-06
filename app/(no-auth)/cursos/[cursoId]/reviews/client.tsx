'use client';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, CheckCircle, Home, Book, TextAlignStart, Calendar, CreditCard, Info, Check, Heart, MessageCircleCode } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Status, StatusIndicator } from '@/components/ui/shadcn-io/status';

import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { useCursos } from "@/hooks/use-cursos";
import Link from "next/link";
import { usePriceFormatter } from '@/hooks/use-price-formatter';
import { beneficiosCursos, categorias, clases, cursos, docente, edicionesCursos, objetivosCursos, preciosCursos, requisitosCursos, reviewsCursos, usuariosEstudiantes } from "@/prisma/generated";
import { FaWhatsapp } from "react-icons/fa";
import { CursoCard } from "@/app/(auth)/(componentes)/curso-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";

import { Star, StarHalf } from "lucide-react";

interface Curso extends cursos {
    categorias: Array<{ categoria: categorias }>
    reviews: Array<reviewsCursos & { usuario: { estudiante: { nombre: string, apellido: string | null, pais: string } | null, avatar: string | null, usuario: string } | null }>
}

export default function CursoReviewsClient({ curso }: { curso: Curso }) {
    const totalReviews = curso.reviews.length;
    const promedioRating = totalReviews > 0
        ? curso.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    return (
        <div className="p-5 space-y-4">
            <h1 className="text-3xl font-semibold">
                Opiniones del Curso {curso.titulo}
            </h1>

            <div className="flex items-center gap-3">
                {/* Estrellas */}
                <div className="flex">
                    {[1, 2, 3, 4, 5].map((estrella) => {
                        if (promedioRating >= estrella) {
                            return <Star key={estrella} className="fill-yellow-500 text-yellow-500 size-4" />;
                        } else if (promedioRating >= estrella - 0.5) {
                            return <StarHalf key={estrella} className="fill-yellow-500 text-yellow-500 size-4" />;
                        } else {
                            return <Star key={estrella} className="text-gray-300 size-4" />;
                        }
                    })}
                </div>

                {/* Puntuación */}
                <p className="font-semibold text-lg">
                    {promedioRating.toFixed(1)} ({totalReviews} reseñas)
                </p>
            </div>
        </div>
    );
}
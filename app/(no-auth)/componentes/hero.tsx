"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, CirclePlay, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
    heading?: string
    description?: string
    badgeText?: string
    badgeLink?: string
    buttonPrimaryText?: string
    buttonPrimaryLink?: string
    buttonSecondaryText?: string
    buttonSecondaryLink?: string
    features?: string[]
    className?: string
}

const HeroSection = ({
    heading = "Transforma tu futuro con educación de calidad",
    description = "La plataforma líder en Latinoamérica con miles de cursos en diferentes áreas. Aprende a tu ritmo con instructores expertos y certificaciones reconocidas.",
    badgeText = "Plataforma educativa para Latinoamérica",
    badgeLink = "#",
    buttonPrimaryText = "Explorar Cursos",
    buttonPrimaryLink = "/cursos",
    buttonSecondaryText = "Cómo Funciona",
    buttonSecondaryLink = "/demo",
    features = [
        "Cursos en diferentes categorías",
        "Instructores expertos certificados",
        "Aprende a tu propio ritmo",
        "Certificados al completar cursos",
        "Acceso desde cualquier dispositivo",
        "Comunidad de aprendizaje activa"
    ],
    className,
}: HeroSectionProps) => {

    return (
        <section className={cn("relative min-h-screen flex items-center justify-center px-6", className)}>
            {/* Fondo */}
            <div className="absolute inset-0 z-0">
                <Image
                    alt="Fondo educativo general"
                    src="/fondo2.jpg"
                    fill
                    className="object-cover brightness-50"
                    priority
                />
            </div>

            {/* Contenido */}
            <div className="relative z-10 text-center max-w-4xl">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Badge
                        variant="secondary"
                        className="rounded-full py-1 border-border bg-white/10 text-white"
                        asChild
                    >
                        <Link href={badgeLink}>
                            {badgeText} <ArrowUpRight className="ml-1 size-4" />
                        </Link>
                    </Badge>
                </motion.div>

                {/* Título */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mt-6 text-4xl sm:text-5xl md:text-6xl md:leading-[1.2] text-white font-semibold tracking-tighter"
                >
                    {heading}
                </motion.h1>

                {/* Descripción */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 text-lg md:text-xl text-white/80"
                >
                    {description}
                </motion.p>


                {/* Botones */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button size="lg" className="rounded-full text-base " asChild>
                        <Link href={buttonPrimaryLink}>
                            {buttonPrimaryText} <ArrowUpRight className="ml-1 size-5" />
                        </Link>
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="rounded-full text-base shadow-none "
                        asChild
                    >
                        <Link href={buttonSecondaryLink}>
                            <CirclePlay className="mr-2 size-5" /> {buttonSecondaryText}
                        </Link>
                    </Button>
                </motion.div>

                {/* Testimonio breve */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mt-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                        <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm text-white">
                            <span className="font-semibold">50,000+ estudiantes</span> en Latinoamérica ya están aprendiendo
                        </span>
                    </div>
                </motion.div>

            </div>
        </section>
    )
}

export default HeroSection
"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { AuroraText } from '@/components/ui/aurora-text'
import { useState, useEffect } from 'react'

const images = [
    "/fondo1.jpg",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
]

const HeroSection = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }, 10000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 min-h-screen  md:pt-[84px]")}>

            {/* Contenido */}
            <div className="flex items-center  justify-center p-5 lg:py-0">
                <div className="max-w-xl flex mx-auto justify-center gap-8 flex-col ">
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-muted-foreground text-sm uppercase "
                    >
                        Educación Digital del Futuro
                    </motion.h3>

                    {/* Título */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-5xl lg:text-7xl  font-bold  space-x-3"
                    >
                        <AuroraText>Nexus</AuroraText>
                        <span>
                            Educa
                        </span>
                    </motion.h1>

                    {/* Descripción */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="md:text-md xl:text-lg leading-relaxed"
                    >
                        Transforma tu aprendizaje con tecnología de vanguardia. Accede a cursos interactivos,
                        certificaciones profesionales y contenido creado por expertos de la industria.
                    </motion.p>

                    {/* Botones */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className='flex gap-4 flex-wrap'
                    >
                        <RainbowButton size="lg" asChild className='rounded-full dark:text-black'>
                            <Link href="/cursos">
                                Explorar Cursos <ChevronRight className="ml-1" />
                            </Link>
                        </RainbowButton>
                        <Button
                            variant="outline"
                            size="lg"
                            asChild
                            className='rounded-full h-11'
                        >
                            <Link href={"/nosotros"}>
                                Sobre Nosotros
                            </Link>
                        </Button>
                    </motion.div>
                </div>


            </div>

            {/* Media Luna - Círculo cortado que sale del borde derecho */}
            <div className="hidden md:flex md:h-[calc(100vh-104px)] items-center ">
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="w-full h-4/5 rounded-l-full overflow-hidden relative"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={images[currentImageIndex]}
                                alt={`Hero Image ${currentImageIndex + 1}`}
                                fill
                                className="object-cover"
                                priority
                            />
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

        </section>
    )
}

export default HeroSection
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";

const SLIDES = [
    {
        title: "Programación de Microcontroladores",
        description: "Domina el arte de programar sistemas embebidos y microcontroladores desde cero.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070",
    },
    {
        title: "Administración de Servidores Cloud",
        description: "Aprende a desplegar y gestionar infraestructuras robustas en la nube.",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=2070",
    },
    {
        title: "IoT y Ciudades Inteligentes",
        description: "Conecta el mundo físico con el digital mediante soluciones IoT innovadoras.",
        image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&q=80&w=2070",
    },
    {
        title: "Desarrollo de Sistemas Críticos",
        description: "Especialízate en sistemas que requieren alta disponibilidad y rendimiento.",
        image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=2070",
    },
];

export default function CarrouselSection() {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(SLIDES.length);

    React.useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap() + 1);
        };

        api.on("select", onSelect);

        // Autoplay implementation - 10 seconds
        const intervalId = setInterval(() => {
            api.scrollNext();
        }, 10000);

        return () => {
            api.off("select", onSelect);
            clearInterval(intervalId);
        };
    }, [api]);

    return (
        <section className="w-full relative overflow-hidden group mb-10">
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {SLIDES.map((slide, index) => (
                        <CarouselItem key={index} className="basis-full">
                            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[21/6] min-h-[450px] md:min-h-[550px] lg:min-h-[650px]">
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-center text-center p-6 md:p-12 pb-24 md:pb-32">
                                    <div className="max-w-4xl space-y-4">
                                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter drop-shadow-lg">
                                            {slide.title}
                                        </h2>
                                        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
                                            {slide.description}
                                        </p>
                                        <div className="pt-4">
                                            <Button size="lg" className="rounded-full px-8 h-12 text-lg shadow-xl hover:scale-105 transition-transform">
                                                Explorar Cursos
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Pill Pagination Indicator */}
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => api?.scrollTo(i)}
                        className={cn(
                            "h-2 transition-all duration-300 rounded-full",
                            current === i + 1
                                ? "w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                : "w-2 bg-white/40 hover:bg-white/60"
                        )}
                        aria-label={`Ir al slide ${i + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

import { Suspense } from "react";
import { ListWithFilters } from "./list";
import { Navbar } from "../static/navbar";
import { Footer } from "../static/footer";

export const metadata = {
    title: "Cursos Online - TecnoSur Perú",
    description: "Explora nuestros cursos especializados en programación de dispositivos, servidores y tecnología",
};

function HeroSection() {
    return (
        <section className="bg-gradient-to-b from-background to-muted/30 border-b">
            <div className="container mx-auto px-4 py-16 md:py-20">
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Cursos Especializados
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Domina la programación de dispositivos, administración de servidores
                        y tecnologías emergentes con nuestros cursos prácticos
                    </p>
                    <div className="pt-4">
                        <div className="inline-flex flex-wrap gap-3 justify-center">
                            <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                                IoT y Dispositivos
                            </span>
                            <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                                Servidores y Redes
                            </span>
                            <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                                Sistemas Embebidos
                            </span>
                            <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                                Cloud Computing
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function CursosSection() {
    return (
        <section className="py-8 md:py-12">
            <div className=" mx-auto px-4">
                <Suspense fallback={
                    <div className="animate-pulse">
                        <div className="h-10 bg-muted rounded w-1/4 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 bg-muted rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                }>
                    <ListWithFilters />
                </Suspense>
            </div>
        </section>
    );
}

export default function Home() {
    return (
        <>
            <Navbar />
            <main>
                <HeroSection />
                <CursosSection />
            </main>
            <Footer />
        </>
    );
}
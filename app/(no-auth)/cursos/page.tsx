import { Suspense } from "react";
import { ListWithFilters } from "./list";
import { Navbar } from "../static/navbar";
import { Footer } from "../static/footer";
import CarrouselSection from "./carrousel";
import { HeroFilters } from "./hero-filters";

export const metadata = {
    title: "Cursos Online - TecnoSur Perú",
    description: "Explora nuestros cursos especializados en programación de dispositivos, servidores y tecnología",
};

function CursosSection() {
    return (
        <section className="py-12 md:py-20">
            <div className="container mx-auto px-4">
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
        <div className="bg-background min-h-screen">
            <Navbar />
            <main className="pt-16 lg:pt-24">
                <CarrouselSection />
                <HeroFilters />
                <CursosSection />
            </main>
            <Footer />
        </div>
    );
}

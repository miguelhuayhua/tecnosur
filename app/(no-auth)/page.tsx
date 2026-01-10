import { Navbar } from "./static/navbar";
import { Footer } from "./static/footer";
import HeroSection from "./componentes/hero";
import CursosEnVivoSection from "./componentes/cursos-vivo-section";
import CursosGrabadoSection from "./componentes/curso-grabado-section";
import WhatsAppButton from "./static/whatsapp-button";
import { ExpandableCards } from "@/components/ui/expandable-cards";
import { ReviewSection } from "./static/review-section";
import MetodosPago from "./static/metodos-pago";
import { prisma } from "@/lib/prisma"
const getReviews = async () => {
  return await prisma.reviewsCursos.findMany({
    take: 20,
    include: {
      usuario: {
        select: {
          usuario: true,
          correo: true,
          avatar: true,
          estudiante: {
            select: {
              nombre: true
            }
          }
        }
      }
    }
  })
}

export default async function Home() {
  const reviews = await getReviews();
  return (
    <div className="overflow-x-hidden" >
      <Navbar />
      <HeroSection />

      <CursosEnVivoSection />
      <div className="bg-muted py-10 border-y">
        <div className="space-y-5 max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-center">
            Explora los métodos de aprendizaje que mejor se ajustan a tus <span className="text-primary">necesidades</span>.
          </h2>
          <p className="text-center text-muted-foreground">
            Creamos opciones que pueden ayudate, te invitamos a explorar nuestros distintos cursos que tenemos para ti.
          </p>
        </div>
        <ExpandableCards className="bg-muted"
          images={[
            {
              src: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=1000&auto=format&fit=crop",
              title: "Cursos en Vivo",
              description: "Aprende en tiempo real con expertos y resuelve tus dudas al instante.",
              href: "/cursos?enVivo=true"
            },
            {
              src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
              title: "Cursos Grabados",
              description: "Estudia a tu propio ritmo con acceso ilimitado a nuestras lecciones premium.",
              href: "/cursos?enVivo=false"
            },
            {
              src: "https://images.unsplash.com/photo-1546410531-bb4caa1b424d?q=80&w=1000&auto=format&fit=crop",
              title: "Ofertas Especiales",
              description: "Aprovecha descuentos exclusivos y potencia tu carrera hoy mismo.",
              href: "/cursos?descuento=true"
            },
            {
              src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop",
              title: "Ver Todo",
              description: "Explora nuestro catálogo completo de formación tecnológica avanzada.",
              href: "/cursos"
            },
          ]}
        />
      </div>
      <CursosGrabadoSection />
      <MetodosPago />
      <ReviewSection reviews={reviews} />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

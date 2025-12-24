import { Navbar } from "./static/navbar";
import { Footer } from "./static/footer";
import HeroSection from "./componentes/hero";
import CursosEnVivoSection from "./componentes/cursos-vivo-section";
import CursosGrabadoSection from "./componentes/curso-grabado-section";

export default function Home() {
  return (
    <div >
      <Navbar />
      <HeroSection />

      <CursosEnVivoSection />
      <CursosGrabadoSection />
      <Footer />
    </div>
  );
}

"use client"

import Link from "next/link"
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { useTheme } from "next-themes"
export function Footer() {
  const currentYear = new Date().getFullYear()
  const { resolvedTheme } = useTheme();
  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Company Info */}
          <div className="space-y-3">
            <div>
              <Link href={'/'}>
                {
                  resolvedTheme == "light" ?
                    <Image alt='logo' width={100} height={100} src={'/logo.png'} /> :
                    <Image alt='logo' width={100} height={100} src={'/dark_logo.png'} />
                }              </Link>
              <p className="text-sm text-muted-foreground">
                Educación tecnológica de calidad para el Perú.
              </p>
            </div>

            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "https://facebook.com/nexuseduca", label: "Facebook" },
                { icon: Instagram, href: "https://instagram.com/nexus_educa", label: "Instagram" },
                { icon: Youtube, href: "https://youtube.com/nexuseduca", label: "YouTube" },
                { icon: Linkedin, href: "https://linkedin.com/company/nexus-educa", label: "LinkedIn" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Cursos */}
          <div>
            <h3 className="font-semibold mb-3">Cursos</h3>
            <ul className="space-y-1.5">
              {[
                { label: "Programación", href: "/cursos/programacion" },
                { label: "Base de Datos", href: "/cursos/bases-datos" },
                { label: "Redes", href: "/cursos/redes" },
                { label: "Seguridad", href: "/cursos/seguridad" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="font-semibold mb-3">Enlaces</h3>
            <ul className="space-y-1.5">
              {[
                { label: "Inicio", href: "/" },
                { label: "Nosotros", href: "/nosotros" },
                { label: "Contacto", href: "/contacto" },
                { label: "Blog", href: "/blog" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="font-semibold mb-3">Información</h3>
            <ul className="space-y-1.5">
              {[
                { label: "Política de Privacidad", href: "/privacidad" },
                { label: "Términos y Condiciones", href: "/terminos" },
                { label: "Preguntas Frecuentes", href: "/faq" },
                { label: "Soporte", href: "/soporte" },
              ].map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Bottom Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Nexus Educa Perú. Educación tecnológica para todos.
          </p>
        </div>
      </div>
    </footer>
  )
}
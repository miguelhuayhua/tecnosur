"use client"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className=" mx-auto px-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          
          <div>
            <h3 className="font-semibold mb-2">Tecsur LATAM</h3>
            <p className="text-sm text-gray-600">
              Especialistas en programación de dispositivos y servidores.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cursos</h3>
            <ul className="text-sm space-y-1">
              {["Programación IoT", "Servidores", "Redes", "Cloud", "Seguridad"].map((item, i) => (
                <li key={i}><Link href="#" className="text-gray-600 hover:text-black">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Enlaces</h3>
            <ul className="text-sm space-y-1">
              {["Nosotros", "Blog", "Contacto", "Soporte"].map((item, i) => (
                <li key={i}><Link href="#" className="text-gray-600 hover:text-black">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Newsletter</h3>
            <div className="flex gap-2">
              <Input placeholder="Email" className="text-sm h-9" />
              <Button size="sm" className="h-9">Enviar</Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Novedades técnicas LATAM</p>
          </div>

        </div>

        <div className="border-t pt-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Tecsur Latinoamérica</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="#" className="hover:text-black">Privacidad</Link>
            <Link href="#" className="hover:text-black">Términos</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
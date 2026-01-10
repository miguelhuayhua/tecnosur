// app/certificados/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, Award, FileText, Users, QrCode, Globe, Lock, Download, Search } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Footer } from "../static/footer";
import { Navbar } from "../static/navbar";

// Componente de contenedor animado
const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}
// Logos reales de los partners en SVG
const MicrosoftLogo = () => (
  <svg width="120" height="40" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5 11.5H0V0H11.5V11.5Z" fill="#F1511B" />
    <path d="M23 11.5H11.5V0H23V11.5Z" fill="#80CC28" />
    <path d="M11.5 23H0V11.5H11.5V23Z" fill="#00ADEF" />
    <path d="M23 23H11.5V11.5H23V23Z" fill="#FBBC09" />
  </svg>
)

const GoogleLogo = () => (
  <svg width="120" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)
// Componente de Feature con diseño único
const FeatureItem = ({ icon: Icon, title, description, delay }: any) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-start space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </motion.div>
  )
}

// Componente de Partner Card
const PartnerCard = ({ partner, delay }: any) => {
  return (
    <AnimatedCard delay={delay}>
      <div className="bg-gradient-to-br from-card to-accent/5 border rounded-lg p-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 p-3 bg-muted rounded-lg flex items-center justify-center">
              {partner.logo}
            </div>
            <div>
              <h3 className="font-bold text-lg">{partner.name}</h3>
              <Badge variant="secondary" className="text-xs">
                Partner Oficial
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
          {partner.description}
        </p>

        <div className="space-y-2">
          {partner.benefits.map((benefit: string, index: number) => (
            <div key={index} className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </AnimatedCard>
  )
}

// Componente de Proceso
const ProcessStep = ({ step, title, description, delay }: any) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay }}
      className="text-center"
    >
      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
        {step}
      </div>
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <p className="text-muted-foreground text-xs">{description}</p>
    </motion.div>
  )
}

export default function CertificadosPage() {
  const partners = [
    {
      name: "Microsoft",
      logo: <MicrosoftLogo />,
      description: "Alianza estratégica con Microsoft Learn para certificaciones en Azure Data Services, Power BI y herramientas empresariales.",
      benefits: [
        "Acceso a Microsoft Learn",
        "Créditos Azure para prácticas",
        "Preparación para certificaciones oficiales",
        "Material actualizado constantemente"
      ]
    },
    {
      name: "Google Cloud",
      logo: <GoogleLogo />,
      description: "Partnership con Google Cloud para formación en Big Data, Machine Learning y análisis de datos con herramientas modernas.",
      benefits: [
        "Acceso a Google Cloud Platform",
        "Certificaciones Google Cloud Ready",
        "Proyectos con datasets reales",
        "Preparación para Data Engineer"
      ]
    }
  ]

  const features = [
    {
      icon: Shield,
      title: "Verificación Digital",
      description: "Código QR único para validación instantánea 24/7"
    },
    {
      icon: Award,
      title: "Reconocimiento Global",
      description: "Válido para oportunidades laborales internacionales"
    },
    {
      icon: Lock,
      title: "Seguridad Garantizada",
      description: "Sistema antifraude con encriptación avanzada"
    },
    {
      icon: Download,
      title: "Descarga Inmediata",
      description: "Disponible en formatos PDF y PNG de alta calidad"
    }
  ]

  const processSteps = [
    {
      step: "01",
      title: "Completar Curso",
      description: "Finaliza todos los módulos y proyectos requeridos"
    },
    {
      step: "02",
      title: "Evaluación Final",
      description: "Aprueba el examen de certificación con nota mínima"
    },
    {
      step: "03",
      title: "Generación Automática",
      description: "Sistema genera tu certificado con código único"
    },
    {
      step: "04",
      title: "Descarga y Comparte",
      description: "Accede desde tu dashboard y comparte en LinkedIn"
    }
  ]

  const benefits = [
    "Válidos para procesos de selección nacionales e internacionales",
    "Incluyen código de verificación único y QR",
    "Descarga digital inmediata al completar el curso",
    "Compartibles en LinkedIn y redes profesionales",
    "Actualización gratuita cuando hay cambios en el programa",
    "Soporte técnico para verificación por empresas"
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <AnimatedCard>
            <Badge variant="secondary" className="mb-6 text-sm">
              Certificaciones Avaladas
            </Badge>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Certificados con validez{" "}
              <span className="text-primary">internacional</span>
            </h1>
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-sm leading-relaxed">
              Respaldados por alianzas estratégicas con los líderes tecnológicos mundiales.
              Tu certificado Data School Bolivia cuenta con el aval de Microsoft y Google Cloud.
            </p>
          </AnimatedCard>

          <AnimatedCard delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/certificados/validar">
                  <Search />
                  Validar Certificado
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Download />
                Guía de Certificación
              </Button>
            </div>
          </AnimatedCard>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 px-4 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <AnimatedCard>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">Alianzas Estratégicas</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                Colaboramos con los líderes tecnológicos para ofrecerte certificaciones de clase mundial
              </p>
            </div>
          </AnimatedCard>

          <div className="grid md:grid-cols-2 gap-6">
            {partners.map((partner, index) => (
              <PartnerCard
                key={index}
                partner={partner}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedCard>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">Características del Certificado</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                Diseñado para brindarte credibilidad y oportunidades profesionales
              </p>
            </div>
          </AnimatedCard>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <AnimatedCard>
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3">Proceso de Certificación</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                Cuatro simples pasos para obtener tu certificado oficial
              </p>
            </div>
          </AnimatedCard>

          <div className="grid md:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={index}
                step={step.step}
                title={step.title}
                description={step.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedCard>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-3">Ventajas Profesionales</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
                Beneficios exclusivos de contar con un certificado Data School Bolivia
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start text-sm p-3 rounded-lg bg-accent/5">
                  <Award className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-2xl mx-auto">
          <AnimatedCard>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <h2 className="text-2xl font-bold mb-4">
              ¿Listo para certificar tu conocimiento?
            </h2>
          </AnimatedCard>

          <AnimatedCard delay={0.4}>
            <p className="text-muted-foreground mb-6 text-sm">
              Obtén tu certificado respaldado por Data School Bolivia y nuestros partners tecnológicos.
              Valida tus habilidades y destaca en el mercado laboral.
            </p>
          </AnimatedCard>

          <AnimatedCard delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/certificados/validar">
                  <FileText className="w-4 h-4 mr-2" />
                  Validar Certificado Existente
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Users className="w-4 h-4 mr-2" />
                Contactar Asesor
              </Button>
            </div>
          </AnimatedCard>
        </div>
      </section>

      <Footer />
    </div>
  )
}
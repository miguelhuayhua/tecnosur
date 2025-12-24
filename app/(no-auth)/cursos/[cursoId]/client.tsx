'use client';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Star, Users, Award, Search, CheckCircle, Home, Book, TextAlignStart, Download, Share2, Shield, Calendar, GraduationCap, FileBadge, FileCodeCorner, BadgeCheck, ScanEye, ShieldCheck, Building, CreditCard, Info } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Status, StatusIndicator, StatusLabel } from '@/components/ui/shadcn-io/status';

import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { useCursos } from "@/hooks/use-cursos";
import Link from "next/link";
import { usePriceFormatter } from '@/hooks/use-price-formatter';
import { beneficiosCursos, clases, docente, edicionesCursos, objetivosCursos, preciosCursos, requisitosCursos } from "@/prisma/generated";
import { Curso } from "@/lib/types";
import { FaWhatsapp } from "react-icons/fa";
import { CursoCard } from "@/app/(auth)/(componentes)/curso-card";

const faqs = [
    {
        question: "¿Qué es DataSchool Bolivia?",
        answer: "DataSchool Bolivia es un centro especializado en la enseñanza de ciencia de datos, análisis y tecnologías relacionadas. Ofrecemos cursos prácticos y actualizados para formar profesionales en el área de datos."
    },
    {
        question: "¿Cómo me registro en la plataforma estudiantil?",
        answer: "Puedes registrarte con tu correo electrónico institucional o personal. Solo necesitas completar el formulario de registro con tus datos básicos y confirmar tu cuenta mediante el enlace que te llegará por correo."
    },
    {
        question: "¿Qué recursos tendré acceso como estudiante?",
        answer: "Tendrás acceso ilimitado a: videos de clases, materiales descargables, ejercicios prácticos, proyectos reales, foros de discusión, sesiones de mentoría y certificados de finalización."
    },
    {
        question: "¿Los cursos tienen algún costo?",
        answer: "Una vez registrado en la plataforma, tendrás acceso gratuito a todos los recursos de los cursos en los que estés matriculado. Algunos programas especializados pueden tener costos adicionales."
    },
    {
        question: "¿Puedo acceder desde cualquier dispositivo?",
        answer: "Sí, nuestra plataforma es completamente responsive y puedes acceder desde tu computadora, tablet o smartphone con conexión a internet."
    },
    {
        question: "¿Cómo obtengo mi certificado?",
        answer: "Al completar satisfactoriamente un curso, recibirás automáticamente un certificado digital verificable que podrás descargar y compartir en tus redes profesionales."
    },
    {
        question: "¿Qué soporte técnico ofrece la plataforma?",
        answer: "Contamos con soporte técnico 24/7 para resolver problemas de acceso, además de foros de comunidad donde puedes hacer preguntas y recibir ayuda de instructores y otros estudiantes."
    },
    {
        question: "¿Puedo avanzar a mi propio ritmo?",
        answer: "Sí, todos nuestros cursos están diseñados para ser tomados de manera asíncrona, permitiéndote avanzar según tu disponibilidad de tiempo y ritmo de aprendizaje."
    }
]
interface CursoProps extends Curso {
    objetivos: objetivosCursos[];
    requisitos: requisitosCursos[];
    beneficios: beneficiosCursos[];
    ediciones: (edicionesCursos & { clases: clases[]; precios: preciosCursos[]; docente: docente })[]
}
export default function CursoDetailClient({ curso }: { curso: CursoProps }) {
    const [searchTerm, setSearchTerm] = useState('');
    const { formatPrice, selectedCurrency } = usePriceFormatter();
    const edicionPrincipal = curso.ediciones?.[0];

    // Extraer datos con nombres correctos de la estructura del servidor
    const categorias = curso.categorias || [];
    const objetivos = curso.objetivos || [];
    const beneficios = curso.beneficios || [];
    const requisitos = curso.requisitos || [];

    // Obtener la edición principal

    // Usar datos de la edición o del curso base
    const fechaInicio = edicionPrincipal?.fechaInicio;
    const fechaFin = edicionPrincipal?.fechaFin;
    const clases = edicionPrincipal?.clases || [];

    // Precios: primero de la edición, luego del curso base
    let precios: preciosCursos[] = [];
    if (edicionPrincipal?.precios?.length > 0) {
        precios = edicionPrincipal.precios;
    }

    const precioDefault = precios.find(p => p.esPrecioDefault) || precios[0];

    // Obtener cursos recomendados usando IDs de categorías
    const { cursos: cursosRecomendados, isLoading } = useCursos({
        categoria: categorias.map((cat: any) => cat.categoria.id).join('&'),
        limit: 4
    });

    // Filtrar clases por búsqueda
    const clasesFiltradas = clases.filter((clase: any) =>
        clase.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clase.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Convertir precios a la moneda seleccionada
    const precioConvertido = precioDefault ? formatPrice(precioDefault.precio) : null;
    const precioOriginalConvertido = precioDefault?.precioOriginal ? formatPrice(precioDefault.precioOriginal) : null;

    // Precios en dólares para comparación
    const precioEnDolares = precioDefault?.precio;
    const precioOriginalEnDolares = precioDefault?.precioOriginal;

    return (
        <div className="space-y-6 bg-background pt-10 px-5">
            <div className="max-w-6xl mx-auto space-y-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/"><Home className='size-4' /></BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className='font-semibold text-xs'>
                                {curso.titulo}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <Badge variant={'outline'} >
                    {categorias[0]?.categoria.nombre || 'Curso'}
                </Badge>

                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold">
                    Curso: {curso.titulo}
                </h1>

                {/* Mostrar código de edición si está disponible */}
                {edicionPrincipal && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Edición: {edicionPrincipal.codigo}</span>
                    </div>
                )}
            </div>

            <div className='max-w-6xl mx-auto grid md:grid-cols-2 mb-10 gap-8'>
                {/* Contenido principal del curso */}
                <div className="space-y-6 mt-10 md:mt-0 order-1 md:order-0 md:pr-8">
                    <h3 className='font-semibold text-muted-foreground'>
                        ¿Qué aprenderás?
                    </h3>
                    <ul className="space-y-4">
                        {objetivos.map((objetivo: any) => (
                            <li key={objetivo.id} className="flex text-muted-foreground text-sm items-center gap-4">
                                <CheckCircle className="size-3.5" />
                                {objetivo.descripcion}
                            </li>
                        ))}
                    </ul>

                    <div className='flex justify-between gap-4'>
                        <div className="flex items-start gap-2">
                            {precioDefault?.esDescuento && (
                                <Badge className="mt-1" variant={'outline'}>
                                    Antes
                                </Badge>
                            )}
                            <span className="font-medium mt-0.5">
                                {selectedCurrency.code}
                            </span>
                            <b className={`text-4xl ${precioDefault?.esDescuento ? 'line-through decoration-primary mr-4' : ''}`}>
                                {precioDefault?.esDescuento ? precioOriginalConvertido?.value : precioConvertido?.value || '0'}
                            </b>
                        </div>
                        {precioDefault?.esDescuento && (
                            <div className="space-y-2">
                                <div className='flex items-start rounded shadow px-2 bg-primary gap-4 text-white'>
                                    <span className='mt-1'>
                                        {selectedCurrency.code}
                                    </span>
                                    <b className='text-4xl'>
                                        {precioConvertido?.value}
                                    </b>
                                </div>
                                <Badge variant={'outline'}>
                                    {precioDefault.porcentajeDescuento}% de descuento
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className='space-x-2'>
                        <Button asChild>
                            <Link href={`/cursos/${curso.id}/checkout`}>
                                <CreditCard />
                                Comprar Curso
                            </Link>
                        </Button>
                        <Button className="bg-green-500">
                            <FaWhatsapp />
                            Más información
                        </Button>
                    </div>

                    <div>
                        <small className='text-muted-foreground text-xs'>
                            Obtén acceso al curso en vivo y al material dentro de nuestra plataforma
                        </small>
                    </div>
                </div>

                {/* Imagen y detalles del curso */}
                <div className='space-y-4'>
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                        <Image
                            fill
                            alt={curso.titulo}
                            className='object-cover'
                            src={curso.urlMiniatura || '/placeholder.svg'}
                            priority
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 divide-x text-sm">
                        <div className="flex items-center gap-2 pr-2">
                            <Award className="size-4" />
                            <span>Certificado incluido</span>
                        </div>
                        {
                            curso.enVivo ? (
                                <Status className="font-normal text-sm" status="online">
                                    <StatusIndicator />
                                    Clase en vivo
                                </Status>
                            ) : (
                                <Badge variant='outline' >
                                    Curso grabado
                                </Badge>
                            )
                        }
                    </div>

                    <div className="flex items-center text-sm gap-2">
                        <Calendar className='size-4' />
                        {fechaInicio && fechaFin ?
                            `Del ${format(new Date(fechaInicio), 'dd MMM', { locale: es })} al ${format(new Date(fechaFin), 'dd MMM yyyy', { locale: es })}` :
                            'Fechas por definir'}
                    </div>

                    <div className="flex items-center text-sm gap-2">
                        <Clock className='size-4' />
                        {fechaInicio && fechaFin ?
                            `Horario: ${format(new Date(fechaInicio), 'HH:mm')} - ${format(new Date(fechaFin), 'HH:mm')}` :
                            'Horario por definir'}
                    </div>
                </div>
            </div>

            <div className="grid max-w-6xl mx-auto grid-cols-1 md:grid-cols-3 mt-20 relative gap-y-10 px-5">
                <div className='col-span-2 space-y-10 md:pr-8'>
                    <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                        <Book /> Contenido del curso
                    </h3>

                    {clasesFiltradas.length > 0 ? (
                        <Accordion type="multiple">
                            {clasesFiltradas.map((clase: any) => (
                                <AccordionItem key={clase.id} value={clase.id}>
                                    <AccordionTrigger>
                                        {clase.titulo}
                                    </AccordionTrigger>
                                    <AccordionContent className="flex flex-col gap-4 text-balance">
                                        <div className="flex items-center gap-3">
                                            <p>{clase.descripcion}</p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {clase.duracion ? `${clase.duracion}m` : '--'}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <p className="text-muted-foreground">
                            Aún no se cuenta con un temario establecido
                        </p>
                    )}

                    <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                        <TextAlignStart /> Sobre el curso
                    </h3>
                    <p className="text-muted-foreground">
                        {curso.descripcion || 'No cuenta con una descripción'}
                    </p>

                    <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                        <Building /> Aprende con Data School Bolivia
                    </h3>
                    <Card className="border-t-3 max-w-sm mx-auto border-t-primary">
                        <CardHeader>
                            <CardTitle className="text-center">
                                Obtén todo el paquete completo con la compra de tu curso
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" asChild>
                                <Link href={`/cursos/${curso.id}/checkout`}>
                                    Comprar Curso
                                </Link>
                            </Button>
                        </CardContent>
                        <CardFooter>
                            {beneficios.length > 0 ? (
                                <ul className="space-y-2 w-full">
                                    {beneficios.map((beneficio: any) => (
                                        <li key={beneficio.id} className="flex items-center text-sm text-muted-foreground gap-2">
                                            <CheckCircle className="size-4" />
                                            {beneficio.descripcion}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm w-full text-center font-bold text-muted-foreground">
                                    No cuenta con beneficios aún.
                                </p>
                            )}
                        </CardFooter>
                    </Card>
                </div>

                {/* Barra lateral con información adicional */}
                <div className='space-y-5 sticky top-20'>
                    <Separator className="block md:hidden" />

                    <div className="hidden md:block">
                        <div className='flex justify-between items-start pb-4 gap-6'>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-3">
                                    {precioDefault?.esDescuento && (
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                                Precio regular
                                            </Badge>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    {selectedCurrency.code}
                                                </span>
                                                <span className="text-2xl line-through text-muted-foreground decoration-2">
                                                    {precioOriginalConvertido?.value || '0'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${precioDefault?.esDescuento ? 'gap-2' : 'gap-1'}`}>
                                        {!precioDefault?.esDescuento && (
                                            <span className="text-sm font-medium text-muted-foreground">Precio actual</span>
                                        )}
                                        <div className="flex items-baseline rounded px-2 justify-center bg-primary text-primary-foreground gap-2">
                                            <span className={`font-medium ${precioDefault?.esDescuento ? 'text-lg' : 'text-sm'}`}>
                                                {selectedCurrency.code}
                                            </span>
                                            <span className={`font-bold ${precioDefault?.esDescuento ? 'text-3xl' : 'text-3xl'}`}>
                                                {precioConvertido?.value || '0'}
                                            </span>
                                        </div>
                                        {precioDefault?.esDescuento && (
                                            <Badge variant={'outline'}>
                                                {precioDefault?.porcentajeDescuento}% de descuento
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {(selectedCurrency.code !== 'USD' && precioEnDolares) && (
                                    <div className="mt-3 p-3 bg-muted/50 rounded-lg border">
                                        <div className="text-xs text-muted-foreground mb-1">Equivalente en dólares:</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">USD</span>
                                            <span className="text-xl font-bold text-foreground">
                                                {precioEnDolares}
                                            </span>
                                            {precioDefault?.esDescuento && precioOriginalEnDolares && (
                                                <span className="text-xl line-through text-muted-foreground ml-2">
                                                    {precioOriginalEnDolares}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Separator />
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Requisitos</h3>
                        <ul className="space-y-1">
                            {requisitos.length > 0 ? (
                                requisitos.map((requisito: any) => (
                                    <li key={requisito.id} className="text-muted-foreground flex items-center text-sm">
                                        <span className="mr-2">•</span> {requisito.descripcion}
                                    </li>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No cuenta aún con requisitos
                                </p>
                            )}
                        </ul>
                    </div>

                    <Separator />

                    <div className="text-sm text-muted-foreground space-y-2">
                        <p className="flex items-center gap-4">
                            <FileBadge className="size-4" />
                            Incluye certificado
                        </p>
                        <p className="flex items-center gap-4">
                            <GraduationCap className="size-4" />
                            Modalidad online
                        </p>
                        <p className="flex items-center gap-4">
                            <FileCodeCorner className="size-4" />
                            Incluye materiales
                        </p>
                    </div>
                </div>
            </div>





            {/* Cursos Recomendados */}
            <div className="space-y-10 border-t py-10 px-5">
                <h3 className="text-3xl font-bold text-center tracking-tight">
                    Cursos recomendados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mx-auto">
                    {cursosRecomendados && cursosRecomendados.length > 0 ? (
                        cursosRecomendados.map((cursoRec: any) => <CursoCard key={cursoRec.id} curso={cursoRec} />)
                    ) : (
                        <p className="text-center w-full col-span-4">
                            No hay cursos relacionados
                        </p>
                    )}
                </div>
            </div>
            {/* FAQ Section */}
            <div className="px-5">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Preguntas Frecuentes
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Encuentra respuestas a las dudas más comunes sobre nuestra plataforma estudiantil
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
}